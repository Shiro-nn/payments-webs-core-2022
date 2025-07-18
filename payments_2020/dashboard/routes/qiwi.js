var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
const vhost = require('../../vhost');
const QiwiBillPaymentsAPI = require('../../bill-payments-node-js-sdk/lib/QiwiBillPaymentsAPI');
const express = require("express"),
router = express.Router();
let accountsData = require("../../base/account");
let shopsData = require("../../base/shop");
let paymentsData = require("../../base/payments");
const config = require("../../config");
const host = config.dashboard.baseURL;
const { get } = require('node-superfetch');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const logger = require("../../helpers/logger");



router.get('/payments/:shopid/qiwi', vhost(host, async(req, res) => {
	let shopData = await shopsData.findOne({ mid: req.params.shopid });
	let paymentData = await paymentsData.findOne({ mid: req.params.shopid });
	var shoplink = config.dashboard.baseURL;
	if(req.query.email === null || req.query.email === undefined){
		res.redirect(`/payments/${req.params.shopid}`);
	}else if((req.query.sum === null || req.query.id === null) || (req.query.sum === undefined || req.query.id === undefined)){
		if(shopData.errorlink !== ''){
			res.redirect(shopData.errorlink);
		}else{
			res.redirect('/')
		}
	}
	if(shopData.suclink !== ''){
		shoplink = shopData.suclink;
	}
    const SECRET_KEY = config.qiwisecret;
    const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);
    const publicKey = config.qiwipublic;
    const params = {
    	publicKey,
    	amount: req.query.sum,
    	billId: `${paymentData.mid}.${paymentData.paymentid}`,
    	successUrl: `https://${shoplink}`,
    	themeCode: "Artur-VzQ5-ezzo6",
    	comment: shopData.name
    };
    const link = qiwiApi.createPaymentForm(params);
    paymentData.payments.push({
		id:{
			id: paymentData.paymentid,
			cid: req.query.id,
	    	sum: req.query.sum,
			suc: false,
	    	email: req.query.email,
			met: "qiwi"
		},
	});
	await paymentData.paymentid++;
	await paymentData.save();
	try{
		res.redirect(link);
		const hook = new Webhook("https://discord.com/api/webhooks/");
		const embed = new MessageBuilder()
		.setTitle('Ожидание Оплаты')
		.setAuthor('payments', 'https://cdn.discordapp.com/avatars/.webp', 'https://payments.fydne.xyz')
		.setURL('https://payments.fydne.xyz')
		.addField(`Email:`, `${req.query.email}`, true)
		.addField(`Shop:`, `${shopData.name}`, true)
		.addField(`Sum:`, `${req.query.sum}`, true)
		.addField(`Метод:`, `qiwi`, true)
		.setColor('#ffff00')
		.setTimestamp();
		hook.send(embed);
	}catch(error){
		logger.log(error, "error")
	}
}));

setInterval(() => {
    shopsData.find({}, async function(err, shops) {
        shops.forEach(async function(shop) {
            checkpayment(shop.mid)
        });
    });
}, 10000);

var checkpayment = async(namev) => {
	const SECRET_KEY = config.qiwisecret;
	const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);
	let shopData = await paymentsData.findOne({ mid: namev });
	if(shopData === null){
		shopData = new paymentsData({ mid: namev });
		await shopData.save();
	}
	let payData = await paymentsData.findOne({ mid: namev });
	if(payData === null){
		payData = new paymentsData({ mid: namev });
		await payData.save();
	}
	payData.payments.forEach(async (payment) => {
	    if(payment.id.met === "qiwi"){
	    	qiwiApi.getBillInfo(`${namev}.${payment.id.id}`).then( async data => {
	    		if(data.status.value === "PAID"){
	    			let paymentData = await paymentsData.findOne({ mid: namev });
	    			paymentData.payments.pull({
	    				id: payment.id
	    			});
	    			await paymentData.save();
	    			let shopData = await shopsData.findOne({ mid: namev });
	    			balanceup(namev, payment.id.sum);
                    sendsuc(namev, payment.id.id, payment.id.cid, payment.id.sum);
					EM.paymentsuc(shopData.namelink, shopData.name, payment.id.email);
					try{
						const hook = new Webhook("https://discord.com/api/");
						const embed = new MessageBuilder()
						.setTitle('Успешная Оплата')
						.setAuthor('payments', 'https://cdn.discordapp.com/.webp', 'https://payments.fydne.xyz')
						.setURL('https://payments.fydne.xyz')
						.addField(`Email:`, `${payment.id.email}`, true)
						.addField(`Shop:`, `${shopData.name}`, true)
						.addField(`Sum:`, `${payment.id.sum}`, true)
						.addField(`Метод:`, `${payment.id.met}`, true)
						.setColor('#15ff00')
						.setTimestamp();
						hook.send(embed);
					}catch(error){
						logger.log(error, "error")
					}
	    		}
	    	}).catch();
	    }
	});
	var balanceup = async(namev, sum)=>{
		setTimeout(async() => {
			let bln = await shopsData.findOne({ mid: namev });
			bln.balance += parseInt(sum);
			await bln.save();
		}, 50);
	}
}
var sendsuc = async(shopid, payid, cuspayid, sum)=>{
	try{
		let shopData = await shopsData.findOne({ mid: shopid });
		if(shopData.notificationlink !== ''){
			await get(`${shopData.notificationlink.replace("https://","http://")}?payid=${payid}&id=${cuspayid}&sum=${sum}`)
		}
	}catch{}
}
module.exports = router;
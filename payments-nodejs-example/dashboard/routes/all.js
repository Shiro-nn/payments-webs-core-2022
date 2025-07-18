const vhost = require('vhost');
const express = require("express"),
router = express.Router();
let paymentsData = require("../../base/payments");
const config = require("../../config");
const host = config.dashboard.baseURL;

router.get('/widget', vhost(host, async(req, res) => {
	let paymentData = await paymentsData.findOne({ id: 1 });
	if(paymentData == null){
		paymentData = new paymentsData({ id: 1 });
	}
	const link = `https://payments.fydne.xyz/payments/1/widget?id=${paymentData.paymentid}&sum=${req.query.sum}`;
	paymentData.payments.push({
		id:{
			id: paymentData.paymentid
		},
	});
	res.redirect(link);
	await paymentData.paymentid++;
	await paymentData.save();
}));
router.get('/', vhost(host, async(req, res) => {
    res.render("index.ejs");
}));
router.post('/', vhost(host, async(req, res) => {
	let paymentData = await paymentsData.findOne({ id: 1 });
	if(paymentData == null){
		paymentData = new paymentsData({ id: 1 });
	}
	if(req.body.donate === 'donate')
	{
		const link = `https://payments.fydne.xyz/payments/1?id=${paymentData.paymentid}&sum=${req.body.sum}`;
		paymentData.payments.push({
			id:{
				id: paymentData.paymentid
			},
		});
		res.redirect(link);
	};
	await paymentData.paymentid++;
	await paymentData.save();
}));

module.exports = router;
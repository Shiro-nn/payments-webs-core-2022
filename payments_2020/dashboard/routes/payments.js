var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
const vhost = require('../../vhost');
const express = require("express"),
router = express.Router();
let accountsData = require("../../base/account");
let shopsData = require("../../base/shop");
let paymentsData = require("../../base/payments");
const config = require("../../config");
const host = config.dashboard.baseURL;
const { get } = require('node-superfetch');



router.get('/payments/:shopid', vhost(host, async(req, res) => {
	let shopData = await shopsData.findOne({ mid: req.params.shopid });
	if(shopData === null){
		res.redirect('/');
	}else{
		if((req.query.id === null || req.query.sum === null) || (req.query.id === undefined || req.query.sum === undefined)){
			let shopData = await shopsData.findOne({ mid: req.params.shopid });
			if(shopData === null){
				res.redirect('/');
			}else if(shopData.errorlink !== ''){
				res.redirect(`${shopData.errorlink}`);
			}else{
				res.redirect('/');
			}
		}else{
			res.render("payments/big.ejs", {
				sdata : shopData,
				id : req.query.id,
				sum : req.query.sum
			});
		}
	}
}));
router.post('/payments/:shopid', vhost(host, async(req, res) => {
	let data = req.body;
	if((req.params.shopid === null || req.query.id === null || req.query.sum === null || data.email === null) ||
	(req.params.shopid === undefined || req.query.id === undefined || req.query.sum === undefined || data.email === undefined)){
		if(req.params.shopid === null){
			res.redirect('/');
		}
		else if((req.query.id === null || req.query.sum === null) || (req.query.id === undefined || req.query.sum === undefined)){
			let shopData = await shopsData.findOne({ mid: req.params.shopid });
			if(shopData === null){
				res.redirect('/');
			}else if(shopData.errorlink !== ''){
				res.redirect(`${shopData.errorlink}`);
			}else{
				res.redirect('/');
			}
		}else{
			res.redirect('/');
		}
	}else{
		if(data.payment === 'qiwi'){
			res.redirect(`/payments/${req.params.shopid}/qiwi?id=${req.query.id}&sum=${req.query.sum}&email=${data.email}`)
		}else if(data.payment === 'yandex'){
			res.redirect(`/payments/${req.params.shopid}/yandex?id=${req.query.id}&sum=${req.query.sum}&email=${data.email}`)
		}else{
			res.redirect(`/payments/${req.params.shopid}?id=${req.query.id}&sum=${req.query.sum}`)
		}
	}
}));


router.get('/payments/widget/:shopid', vhost(host, async(req, res) => {
	let shopData = await shopsData.findOne({ mid: req.params.shopid });
	if(shopData === null){
		res.redirect('/');
	}else{
		if((req.query.id === null || req.query.sum === null) || (req.query.id === undefined || req.query.sum === undefined)){
			let shopData = await shopsData.findOne({ mid: req.params.shopid });
			if(shopData === null){
				res.redirect('/');
			}else if(shopData.errorlink !== ''){
				res.redirect(`${shopData.errorlink}`);
			}else{
				res.redirect('/');
			}
		}else{
			res.render("payments/widget.ejs", {
				sdata : shopData,
				id : req.query.id,
				sum : req.query.sum
			});
		}
	}
}));
router.post('/payments/widget/:shopid', vhost(host, async(req, res) => {
	let data = req.body;
	if((req.params.shopid === null || req.query.id === null || req.query.sum === null || data.email === null) ||
	(req.params.shopid === undefined || req.query.id === undefined || req.query.sum === undefined || data.email === undefined)){
		if(req.params.shopid === null){
			res.redirect('/');
		}
		else if((req.query.id === null || req.query.sum === null) || (req.query.id === undefined || req.query.sum === undefined)){
			let shopData = await shopsData.findOne({ mid: req.params.shopid });
			if(shopData === null){
				res.redirect('/');
			}else if(shopData.errorlink !== ''){
				res.redirect(`${shopData.errorlink}`);
			}else{
				res.redirect('/');
			}
		}else{
			res.redirect('/');
		}
	}else{
		if(data.payment === 'qiwi'){
			res.redirect(`/payments/${req.params.shopid}/qiwi?id=${req.query.id}&sum=${req.query.sum}&email=${data.email}`)
		}else if(data.payment === 'yandex'){
			res.redirect(`/payments/${req.params.shopid}/yandex?id=${req.query.id}&sum=${req.query.sum}&email=${data.email}`)
		}else{
			res.redirect(`/payments/${req.params.shopid}?id=${req.query.id}&sum=${req.query.sum}`)
		}
	}
}));
module.exports = router;
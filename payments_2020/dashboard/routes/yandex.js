var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
const vhost = require('../../vhost');
const express = require("express"),
router = express.Router();
let accountsData = require("../../base/account");
let shopsData = require("../../base/shop");
const config = require("../../config");
const host = config.dashboard.baseURL;
const { get } = require('node-superfetch');

var yandexMoney = require("../../yandex-money-sdk-nodejs");
var scope = ['account-info', 'operation-history'];
var url = yandexMoney.Wallet.buildObtainTokenUrl(config.yandexid, config.yandexurl, scope);


async function succookie(key, name, res) {res.cookie(name, key, { expires: new Date(253402300000000) });}
router.get("/payments/:shopid/yandex", async function(req, res) {
	let shopData = await shopsData.findOne({ mid: req.params.shopid });
	if(req.query.email === null || req.query.email === undefined){
        res.render("payments/yandex/topayments.ejs", {
            id : req.params.shopid
        });
	}else if((req.query.sum === null || req.query.id === null) || (req.query.sum === undefined || req.query.id === undefined)){
		if(shopData.errorlink !== ''){
			res.redirect(shopData.errorlink);
		}else{
			res.redirect('/')
		}
	}
    if (req.cookies.redirect == undefined){
        succookie('https://' + req.headers.host + req.url, 'redirect', res);
    }else{
        res.clearCookie('redirect');
        succookie('https://' + req.headers.host + req.url, 'redirect', res);
    }
    if (req.cookies.yandex == undefined){
        res.render("payments/yandex/toyandex.ejs", {
            url : url
        });
    }else{
        var api = new yandexMoney.Wallet(req.cookies.yandex);
        api.accountInfo(function infoComplete(err, data) {
            if(err) {
                res.render("payments/yandex/toyandex.ejs", {
                    url : url
                });
            }else{
                if(req.query.sum > data.balance){
                    res.redirect(req.cookies.redirect.replace("/yandex", ""))
                    return;
                }
                console.log(err)
                console.log(data)
                var options = {
                    "pattern_id": "p2p",
                    "to": "4100111513177101",
                    "amount": req.query.sum || 1,
                    "comment": "Оплата",
                    "message": "Оплата",
                    "expire_period": 7
                };
                api.requestPayment(options, function requestComplete(err, data) {
                    if(err) {
                        res.render("payments/yandex/toyandex.ejs", {
                            url : url
                        });
                    }
                    if(data == undefined){
                        res.render("payments/yandex/toyandex.ejs", {
                            url : url
                        });
                        return;
                    }
                    console.log(data)
                    if(data.status !== "success") {
                        res.render("payments/yandex/toyandex.ejs", {
                            url : url
                        });
                    }
                    var request_id = data.request_id;
                    
                    api.processPayment({
                        "request_id": request_id
                        }, processComplete);
                    });
                    
                    function processComplete(err, data) {
                    if(err) {
                        res.render("payments/yandex/toyandex.ejs", {
                            url : url
                        });
                    }
                    // process status
                    console.log(data)
                }
            }
        });
    }
})
router.get("/login/yandex", async function(req, res) {
    yandexMoney.Wallet.getAccessToken(config.yandexid, req.query.code, config.yandexurl, config.yandexsecret, tokenComplete);
    function tokenComplete(err, data) {
        if(err) {
            res.render("payments/yandex/toyandex.ejs", {
                url : url
            });
        }else{
            succookie(data.access_token, 'yandex', res);
            if (req.cookies.redirect == undefined){
                res.redirect('/');
            }else{
                res.redirect(req.cookies.redirect);
            }
        }
    }
})
module.exports = router;
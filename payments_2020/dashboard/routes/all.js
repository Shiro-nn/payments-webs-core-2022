var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
const vhost = require('../../vhost');
const express = require("express"),
router = express.Router();
let accountsData = require("../../base/account");
let shopsData = require("../../base/shop");
const config = require("../../config");
const host = config.dashboard.baseURL;

router.get('/', vhost(host, async(req, res) => {
	if (req.session.user == null){
        res.render("index.ejs", {
            is_logged: false
        });
    } else {
        res.render("index.ejs", {
            is_logged: true,
            udata : req.session.user
        });
    }
}));
router.get('/ip', vhost(host, (req, res) => {
	res.redirect("/ip/index.txt");
}));
router.get('/selector', vhost(host, async(req, res) => {
	if (req.session.user == null){
        res.redirect("/login");
    } else {
		let userData = await accountsData.findOne({ user: req.session.user.user });
		req.session.user = userData;
		shopsData.find({}, async function(err, shops) {
            res.render("selector.ejs", {
                is_logged: true,
                shops : shops,
                udata : req.session.user
	    	});
	    });
    }
}));
router.get('/shop/:shopid', vhost(host, async(req, res) => {
	if (req.session.user == null){
        res.redirect("/login");
    } else {
		let shopData = await shopsData.findOne({ mid: req.params.shopid });
		if(shopData === null){
			res.redirect("/selector");
		}
		else if(shopData.owner === req.session.user.user){
			let userData = await accountsData.findOne({ user: req.session.user.user });
			req.session.user = userData;
			res.render("shop/index.ejs", {
				is_logged: true,
				udata : req.session.user,
				sdata : shopData
			});
		}else{
			res.redirect("/selector");
		}
    }
}));
router.get('/shop/:shopid/settings', vhost(host, async(req, res) => {
	if (req.session.user == null){
        res.redirect("/login");
    } else {
		let shopData = await shopsData.findOne({ mid: req.params.shopid });
		if(shopData === null){
			res.redirect("/selector");
		}
		else if(shopData.owner === req.session.user.user){
			let userData = await accountsData.findOne({ user: req.session.user.user });
			req.session.user = userData;
			res.render("shop/settings.ejs", {
				is_logged: true,
				udata : req.session.user,
				sdata : shopData
			});
		}else{
			res.redirect("/selector");
		}
    }
}));
router.get('/shop/:shopid/verify', vhost(host, async(req, res) => {
	if(req.session.verify == undefined || req.session.verify == null){
		req.session.verify = {};
		req.session.verify.suc = false;
		req.session.verify.error = false;
	}else{
		if (req.session.verify.suc == undefined || req.session.verify.suc == null){
			req.session.verify.suc = false;
		}
		if (req.session.verify.error == undefined || req.session.verify.error == null){
			req.session.verify.error = false;
		}
	}
	if (req.session.user == null){
        res.redirect("/login");
    } else {
		let shopData = await shopsData.findOne({ mid: req.params.shopid });
		if(shopData === null){
			res.redirect("/selector");
		}
		else if(!shopData.verify && shopData.owner === req.session.user.user){
			if(shopData.verifykey === ''){
				let verifykey = guid();
				shopData.verifykey = verifykey;
				await shopData.save();
				res.render("shop/verify.ejs", {
					sdata : shopData,
					error : req.session.verify.error,
					suc  : req.session.verify.suc
				});
			}else{
				res.render("shop/verify.ejs", {
					sdata : shopData,
					error : req.session.verify.error,
					suc  : req.session.verify.suc
				});
			}
		}else{
			res.redirect("/selector");
		}
    }
}));
router.get('/account', vhost(host, async(req, res) => {
	if (req.session.user == null){
        res.redirect("/login");
    } else {
		let userData = await accountsData.findOne({ user: req.session.user.user });
        res.render("settings/stata.ejs", {
            is_logged: true,
			udata : req.session.user
        });
    }
}));
router.get('/account/configs', vhost(host, async(req, res) => {
	if (req.session.user == null){
        res.redirect("/login");
    } else {
		let userData = await accountsData.findOne({ user: req.session.user.user });
        res.render("settings/configs.ejs", {
            is_logged: true,
            udata : req.session.user
        });
    }
}));
router.get('/login', function(req, res){
	if (req.cookies.login == undefined){
		res.render('login.ejs');
	}else{
		accountsData.findOne({cookie:req.cookies.login, ip:req.ip.replace('::ffff:', '')}, function(e, o){
			if (o){
				autoLogin(o.user, o.pass, function(o){
					req.session.user = o;
					res.redirect('/account');
				});
			}else{
				res.render('login.ejs');
			}
		})
		function autoLogin(user, pass, callback)
		{
			accountsData.findOne({user:user}, function(e, o) {
				if (o){
					o.pass == pass ? callback(o) : callback(null);
				}else{
					callback(null);
				}
			});
		}
	}
});
router.get('/signup', function(req, res) {
	res.render('signup.ejs');
});
router.get('/reset-password', function(req, res) {
	validatePasswordKey(req.query['key'], req.ip.replace('::ffff:', ''), function(e, o){
		if (e || o == null){
			res.redirect('/');
		} else{
			req.session.passKey = req.query['key'];
			res.render('reset.ejs', { title : 'Сброс пароля' });
		}
	})
	function validatePasswordKey(passKey, ipAddress, callback)
	{
		accountsData.findOne({passKey:passKey, ip:ipAddress}, callback);
	}
});
const guid = function(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}

module.exports = router;
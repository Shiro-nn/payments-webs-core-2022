var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
const express = require("express"),
router = express.Router();
const vhost = require('../../vhost');
let accountsData = require("../../base/account");
let shopsData = require("../../base/shop");
let allsData = require("../../base/all");
const crypto = require('crypto');
const config = require("../../config");
const host = config.dashboard.baseURL;


router.post('/signup', async(req, res) => {
	accountsData.findOne({ user: req.body['user'] }, async function(e, o) {
		if(o){
			res.status(400).send('username-taken');
		} else{
			accountsData.findOne({ email: req.body['email'] }, async function(e, o) {
				if(o){
					res.status(400).send('email-taken');
				} else{
					let pass = req.body['pass'];
					saltAndHash(req.body['pass'], function(hash){
						pass = hash;
					});
					var date = new Date();
					var day = date.getDate();
					var month = date.getMonth() + 1;    
					var year = date.getFullYear();  
					var hour = date.getHours();     
					var minute = date.getMinutes(); 
					var second = date.getSeconds(); 
					const mmm = date.getMonth() + 2;
					if(mmm == '10' || mmm == '11' || mmm == "12" || mmm == '13'){ } else {
						var t = "0";
						t += month;
						month = t;
					}
					if(mmm == '13'){
						month = "01";
						year = date.getFullYear() + 1;
					}
					var time = day + "/" + month + "/" + year + " " + hour + ':' + minute + ':' + second;
					let userData = await CreateAccount({
						email 	: req.body['email'],
						user 	: req.body['user'],
						pass	: pass,
						date    : time
					});
					await userData.save();
					res.status(200).send('ok');
					EM.register(userData);
				}
			});
		}
	});
});
router.post('/login', async(req, res) => {
	accountsData.findOne({ user: req.body['user'] }, async function(e, o) {
		if(e){
			res.status(400).send('user-not-found');
		} else if(o){
			let userData = await accountsData.findOne({ user: req.body['user'] });
			validatePassword(req.body['pass'], userData.pass, function(err, res) {
				if (res)
				{
					req.session.user = userData;
					if (req.body['remember-me'] == 'false'){
						suclogin();
					}
					else
					{
						generateLoginKey(o.user, req.ip.replace('::ffff:', ''), function(key){
							succookie(key);
							suclogin();
						});
					}
				}
				else
				{
					errorlogin();
				}
			});
		}
	});
	async function errorlogin() {res.status(400).send('invalid-password');}
	async function suclogin() {res.status(200).send('success');}
	async function succookie(key) {res.cookie('login', key, { expires: new Date(253402300000000) });}
});
router.post('/logout', function(req, res){
	res.clearCookie('login');
	req.session.destroy(function(e){ res.status(200).send('ok'); });
})

router.post('/lost-password', async(req, res) => {
	let email = req.body['email'];
	check(email, req.ip.replace('::ffff:', ''), function(e, account){
		if (e){
			res.status(400).send(e);
		}else{
			EM.dispatchResetPasswordLink(account, function(e, m){
				if (!e){
					res.status(200).send('ok');
				}	else{
					for (k in e) console.log('ERROR : ', k, e[k]);
					res.status(400).send('невозможно отправить сброс пароля');
				}
			});
		}
	});
	async function check(email, ipAddress, callback)
    {
		let passKey = guid();
		let accountData = await accountsData.findOne({email:email});
		if(accountData == null){
			callback('account not found');
		}else{
			accountData.ip = ipAddress;
			accountData.passKey = passKey;
			accountData.cookie = "";
			await accountData.save();
			callback(null, accountData);
		}
    }
});

router.post('/reset-password', async(req, res) =>  {
	let newPass = req.body['pass'];
	let passKey = req.session.passKey;
	req.session.destroy();
	password(passKey, newPass, function(e, o){
		if (o){
			res.status(200).send('ok');
		}else{
			res.status(400).send('невозможно обновить пароль');
		}
	})
	function password(passKey, newPass, callback)
	{
	    saltAndHash(newPass, function(hash){
	    	newPass = hash;
	    	accountsData.findOneAndUpdate({passKey:passKey}, {$set:{pass:newPass}, $set:{ip:req.ip.replace('::ffff:', '')}, $unset:{passKey:''}}, {returnOriginal : false}, callback);
	    });
    }
});

router.post('/delete', async(req, res) => {
	deleteAccount(req.client, req.session.user.email, function(e, obj){
		if (!e){
			res.clearCookie('login');
			req.session.destroy(function(e){ res.status(200).send('ok'); });
		}	else{
			res.status(400).send('запись не найдена');
		}
	});
	function deleteAccount(client, email, callback)
    {
		accountsData.findOne({email:email});
    	accountsData.deleteOne({email: email}, callback);
    }
});

router.post('/selector', vhost(host, async(req, res) => {
	try{
		if(req.body.section === 'create'){
			let allData = await allsData.findOne();
			if(allData == null){
				allData = new allsData();
			}
			allData.shopsid++;
			allData.save();
			await CreateShop({
				email 	: req.session.user.email,
				owner 	: req.session.user.user,
				name 	: req.body['sname'],
				img 	: req.body['img'],
				mid 	: allData.shopsid
			});
			res.redirect('/selector');
		}else{
			res.redirect('/selector');
		}
	}catch{
		res.redirect('/selector');
	}
}));

var CreateShop = async(param, isLean) => {
	return new Promise(async function (resolve, reject){
		let shopData = new shopsData(param);
		await shopData.save();
		resolve(isLean ? shopData.toJSON() : shopData);
	});
}
const guid = function(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}
var CreateAccount = async(param, isLean) => {
	return new Promise(async function (resolve, reject){
		let accountData = new accountsData(param);
		await accountData.save();
		resolve(isLean ? accountData.toJSON() : accountData);
	});
}
var sha256 = function(str) {
	return crypto.createHash('sha256').update(str).digest('hex');
}
var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}
var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + sha256(pass + salt));
}
var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + sha256(plainPass + salt);
	callback(null, hashedPass === validHash);
}
var generateLoginKey = async function(user, ipAddress, callback)
{
	let cookie = guid();
	let userData = await accountsData.findOne({user:user});
	userData.ip = ipAddress;
	userData.cookie = cookie;
	await userData.save();
	callback(cookie);
}




router.post('/shop/:shopid/settings', vhost(host, async(req, res) => {
	let data = req.body;
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
			if(data.settings === 'settings'){
				if(data.lr !== ''){
					let search = await shopsData.findOne({ namelink: data.lr });
					if(search === null){
						shopData.namelink = data.lr;
					}else{
						if(!search.verify){
							shopData.namelink = data.lr;
							search.namelink = '';
							search.save();
						}
					}
				}
				if(data.nr !== ''){
					shopData.notificationlink = data.nr;
				}
				if(data.ar !== ''){
					shopData.suclink = data.ar;
				}
				if(data.fr !== ''){
					shopData.errorlink = data.fr;
				}
				await shopData.save();
			}else if(data.output === 'output'){
				let shopData = await shopsData.findOne({ mid: req.params.shopid });
				let userData = await accountsData.findOne({ user: shopData.owner });
				if(shopData.balance >= data.sum){
					userData.balance += data.sum;
					shopData.balance -= data.sum;
				}
				await userData.save();
				await shopData.save();
			}
			res.redirect(`/shop/${req.params.shopid}/settings`);
		}else{
			res.redirect("/selector");
		}
    }
}));
router.post('/shop/:shopid/verify', vhost(host, async(req, res) => {
	if (req.session.user == null){
        res.redirect("/login");
    } else {
		let shopData = await shopsData.findOne({ mid: req.params.shopid });
		if(shopData === null){
			res.redirect("/selector");
		}
		else if(!shopData.verify && shopData.owner === req.session.user.user){
			if(shopData.verifykey === ''){
				res.redirect(`/shop/${req.params.shopid}/verify`)
			}else{
				const { get } = require('node-superfetch');
				let check = '';
				try{
					const { body } = await get(`${shopData.namelink}/.verify/fydne/payments.txt`)
					check = body;
				}catch{
					try{
						let lnk = shopData.namelink.replace('https', '').replace('http', '');
						const { body } = await get(`http${lnk}/.verify/fydne/payments.txt`);
						check = body;
					}catch{
						req.session.verify.suc = false;
						req.session.verify.error = true;
						try{
							res.redirect(`/shop/${req.params.shopid}/verify`)
						}catch{}
					}
				}
				if(check === shopData.verifykey){
					shopData.verify = true;
					shopData.verifykey = '';
					await shopData.save();
					req.session.verify.suc = true;
					req.session.verify.error = false;
					try{
						res.redirect(`/shop/${req.params.shopid}/verify`)
					}catch{}
				}else{
					req.session.verify.suc = false;
					req.session.verify.error = true;
					try{
						res.redirect(`/shop/${req.params.shopid}/verify`)
					}catch{}
				}
			}
		}else{
			res.redirect("/selector");
		}
	}
}));
router.post('/account/configs', vhost(host, async(req, res) => {
	const QiwiBillPaymentsAPI = require('../../bill-payments-node-js-sdk/lib/QiwiBillPaymentsAPI');
	let data = req.body;
	console.log(data);
	if (req.session.user == null){
        res.redirect("/login");
    } else {
		let userData = await accountsData.findOne({ user: req.session.user.user });
		req.session.user = userData;
		if(userData.balance >= data.sum){
			const qiwiApi = new QiwiBillPaymentsAPI(config.qiwisecret);
			const balance = qiwiApi.balance();
			console.log(balance)
		}
		const qiwiApi = new QiwiBillPaymentsAPI(config.qiwisecret);
		const balance = qiwiApi.balance();
		console.log(balance)
    }
}));
module.exports = router;
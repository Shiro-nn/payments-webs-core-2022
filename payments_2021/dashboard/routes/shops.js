const vhost = require('vhost');
const express = require("express"),
router = express.Router();
const io = require("socket.io-client");
const socket = io("https://localhost", {secure: true, rejectUnauthorized: false});
const accountsData = require("../../base/accounts");
const countsData = require("../../base/counts");
const shopsData = require("../../base/shops");
const statsData = require("../../base/stats");
const dates = require("./modules/dates");
const config = require("../../config");
const host = config.dashboard.baseURL;
const cdn_host_link = config.dashboard.cdn;
const cdn_reserve = config.dashboard.cdn_reserve;
router.get('/shops', vhost(host, async(req, res) => {
	if (req.session.user == null) return res.redirect(`/authorization?redirect=shops`);
	let cdn_host = cdn_host_link;
	if (req.cookies.cdn != undefined) cdn_host = cdn_reserve;
    let userData = await accountsData.findOne({ id: req.session.user.id });
    let shops = await shopsData.find({ owner: req.session.user.id });
    req.session.user = userData;
	res.render("shops/list.ejs", {cdn_host, is_logged: true, udata: req.session.user, shops});
}));
router.get('/shops/:shop', vhost(host, async(req, res, next) => {
    const shop = parseInt(req.params.shop);
    if(isNaN(shop)) return next();
	if (req.session.user == null) return res.redirect(`/authorization?redirect=shops/${shop}`);
	let cdn_host = cdn_host_link;
	if (req.cookies.cdn != undefined) cdn_host = cdn_reserve;
    let userData = await accountsData.findOne({ id: req.session.user.id });
    let shopData = await shopsData.findOne({ owner: req.session.user.id, id: shop });
    if(shopData == null || shopData == undefined) return next();
    req.session.user = userData;
	res.render("shops/shop.ejs", {cdn_host, is_logged: true, udata: req.session.user, shop: shopData});
}));
router.post('/shops/create', vhost(host, async(req, res) => {
	if (req.session.user == null) return res.status(401).send('401');
    const _name = req.body.name;
    if(_name == null || _name == undefined || _name.length < 4) return res.status(400).send('name-few-length');
    if(_name.length > 20) return res.status(400).send('name-many-length');
    let counts = await countsData.findOne();
    if(counts === null || counts === undefined) counts = new countsData({shops: 0});
    counts.shops++;
    await counts.save();
    async function GeneratePublic() {
        const key_public = guid();
        const _shop = await shopsData.findOne({key_public});
        if(_shop == null || _shop == undefined) GeneratePrivate();
        else GeneratePublic();
        async function GeneratePrivate() {
            const key_private = guid()+guid();
            const __shop = await shopsData.findOne({key_private});
            if(__shop == null || __shop == undefined) Later();
            else GeneratePrivate();
            async function Later() {
                await new shopsData({
                    name: _name,
                    owner: req.session.user.id,
                    id: counts.shops, key_private, key_public
                }).save();
                const statData = await statsData.findOne({shop:counts.shops});
                if(statData == null || statData == undefined){
                    const _stats = await new statsData({shop:counts.shops});
                    _stats.labels.push(dates.GetStatsDate());
                    _stats.markModified('labels');
                    await _stats.save();
                }
                res.json({status: 'successfully', link: `/shops/${counts.shops}`});
            }
        }
    }
    GeneratePublic();
}));
router.post('/shops/:shop/set', vhost(host, async(req, res) => {
    const shop = parseInt(req.params.shop);
    if(isNaN(shop)) return res.status(400).send('400');
	if (req.session.user == null) return res.status(401).send('401');
    let shopData = await shopsData.findOne({ owner: req.session.user.id, id: shop });
    if(shopData == null || shopData == undefined) return res.status(404).send(404);
	const type = req.query.type;
    if(type == 'name'){
        const _name = req.body.name;
        if(_name == null || _name == undefined || _name.length < 4) return res.status(400).send('name-few-length');
        if(_name.length > 20) return res.status(400).send('name-many-length');
        shopData.name = _name;
        await shopData.save();
        res.send('successfully');
    }
    else if(type == 'avatar'){
		let data = req.body;
		shopData.avatar = `${cdn_host_link}/qurre.store/shops/${shop}/${data.hash}.${data.format}`;
        await shopData.save();
        res.send('successfully');
    }
    else if(type == 'link_main'){
        const _link = req.body.link;
        if(_link == null || _link == undefined || !IsUrl(_link)) return res.status(400).send('not_url');
		shopData.links.main = _link;
        shopData.markModified('links');
        await shopData.save();
        res.send('successfully');
    }
    else if(type == 'link_successfully'){
        const _link = req.body.link;
        if(_link == null || _link == undefined || !IsUrl(_link)) return res.status(400).send('not_url');
		shopData.links.successfully = _link;
        shopData.markModified('links');
        await shopData.save();
        res.send('successfully');
    }
    else if(type == 'link_error'){
        const _link = req.body.link;
        if(_link == null || _link == undefined || !IsUrl(_link)) return res.status(400).send('not_url');
		shopData.links.error = _link;
        shopData.markModified('links');
        await shopData.save();
        res.send('successfully');
    }
    else if(type == 'link_notification'){
        const _link = req.body.link;
        if(_link == null || _link == undefined || !IsUrl(_link)) return res.status(400).send('not_url');
		shopData.links.notification = _link;
        shopData.markModified('links');
        await shopData.save();
        res.send('successfully');
    }
    else if(type == 'webhook'){
        const _link = req.body.link;
        if(_link == null || _link == undefined || !IsUrl(_link)) return res.status(400).send('not_url');
		shopData.webhook = _link;
        await shopData.save();
        res.send('successfully');
    }
    else if(type == 'public_key'){
        async function GenerateKey() {
            const key_public = guid();
            const _shop = await shopsData.findOne({key_public});
            if(_shop == null || _shop == undefined) Later();
            else GenerateKey();
            async function Later() {
                shopData.key_public = key_public;
                await shopData.save();
                res.send('successfully');
            }
        }
        await GenerateKey();
    }
    else if(type == 'private_key'){
        async function GenerateKey() {
            const key_private = guid()+guid();
            const _shop = await shopsData.findOne({key_private});
            if(_shop == null || _shop == undefined) Later();
            else GenerateKey();
            async function Later() {
                shopData.key_private = key_private;
                await shopData.save();
                res.json({status:'successfully', key:key_private});
            }
        }
        await GenerateKey();
    }
    else if(type == 'withdrawal'){
        const data = req.body;
        const { Webhook, MessageBuilder } = require('discord-webhook-node');
        let method = '';
        if(data.method == 1) method = 'Qiwi';
        else if(data.method == 2) method = 'YooMoney';
        else if(data.method == 3) method = 'Карта';
        else if(data.method == 4) method = 'Номер телефона';
        const embed = new MessageBuilder()
        .setTitle('Запрос на вывод средст')
        .setAuthor('Qurre Pay', 'https://cdn.scpsl.store/qurre/payments.png', `https://${config.dashboard.baseURL}`)
        .setURL(`https://${config.dashboard.baseURL}/shops/${shopData.id}`)
        .setDescription(`Запрос на вывод средст '${shopData.name}'`)
        .addField(`Сумма:`, `${data.sum}₽`, true)
        .addField(`Метод:`, `${method}`, true)
        .addField(`Кошелек:`, `${data.to}`, true)
        .setColor('#15ff00')
        .setTimestamp();
        try{
            const hook = new Webhook('https://discord.com/api/webhooks/');
            hook.setUsername('Qurre Pay'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
            hook.send(embed);
        }catch{}
        res.send('successfully');
    }
    else res.status(400).send('400');
    function IsUrl(url) {
        return /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig.test(url);
    }
}));
router.post('/shops/:shop/info', vhost(host, async(req, res) => {
    const shop = parseInt(req.params.shop);
    if(isNaN(shop)) return res.status(400).send('400');
	if (req.session.user == null) return res.status(401).send('401');
	const type = req.query.type;
    if(type == 'initial'){
		if(req.session.user == null || req.session.user == undefined) return res.status(401).send('401');
		socket.emit('initial', req.session.user.id, shop, req.body.socket);
		return res.sendStatus(200);
	}
    else res.status(400).send('400')
}));
module.exports = router;
const guid = function(){return 'xxxxxxxxx4xxxyxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});}
const vhost = require('vhost');
const express = require("express"),
router = express.Router();
const config = require("../../config");
const host = config.dashboard.baseURL;
const paymentsData = require("../../base/payments");
const shopsData = require("../../base/shops");
const statsData = require("../../base/stats");
const dates = require("./modules/dates");
const sendNotify = require("./modules/sendNotify");
router.post('/check/qiwi/new', async(req, res, next) => {
    const _ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).replace('::ffff:', '').replace('::1', '127.0.0.1');
    if(_ip != '185.195.26.155') return next();
    const id = req.body.payment;
    const pay = await paymentsData.findOne({code:id});
    try{sendNotify.Send(pay.shop, pay)}catch(err){
        const { Webhook } = require('discord-webhook-node');
        const hook = new Webhook("https://discord.com/api/webhooks/");
        hook.setUsername('Payments Web'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
        hook.send(`Произошла ошибка.\nМестоположение: \`Проверка оплаты через телефон\`\nКод ошибки:\n${err}`);
    }
});
router.post('/check/qiwi', vhost(host, async(req, res) => {
    const data = req.body;
    const pay = await paymentsData.findOne({code:data.bill.billId});
    if(pay == null || pay == undefined) return res.sendStatus(400);
    if(pay.paid || pay.canceled) return res.sendStatus(200);
    if(data.bill.status.value != 'PAID') return res.sendStatus(403);
    if(parseFloat(data.bill.amount.value) != parseFloat(pay.sum)) return res.sendStatus(403);
    pay.paid = true;
    pay.method = data.bill.customer.account;
    await pay.save();
    const statData = await statsData.findOne({shop:pay.shop});
    if(statData != null && statData != undefined){
        statData.success.push(dates.GetStatsDate());
        statData.markModified('success');
        await statData.save();
    }
    const shop = await shopsData.findOne({ id: pay.shop });
    if(shop == null || shop == undefined) return res.sendStatus(400);
    shop.balance += pay.sum;
    await shop.save();
    res.sendStatus(200);
    try{sendNotify.Send(pay.shop, pay)}catch(err){
        const { Webhook } = require('discord-webhook-node');
        const hook = new Webhook("https://discord.com/api/webhooks/");
        hook.setUsername('Payments Web'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
        hook.send(`Произошла ошибка.\nМестоположение: \`Проверка оплаты через телефон\`\nКод ошибки:\n${err}`);
    }
    {
        let method = 'Qiwi';
        if(pay.method == 'card') method = 'Карта';
        const { Webhook, MessageBuilder } = require('discord-webhook-node');
        const embed = new MessageBuilder()
        .setTitle('Успешная оплата счета')
        .setAuthor('Qurre Pay', 'https://cdn.scpsl.store/qurre/payments.png', `https://${config.dashboard.baseURL}`)
        .setURL(`https://${config.dashboard.baseURL}/pay/${pay.code}`)
        .setDescription(`Счет выставлен '${shop.name}'`)
        .addField(`Сумма:`, `${pay.sum}₽`, true)
        .addField(`Метод:`, `${method}`, true)
        .setColor('#15ff00')
        .setTimestamp();
        try{
            const hook = new Webhook(shop.webhook);
            hook.setUsername('Qurre Pay'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
            hook.send(embed);
        }catch{}
        try{
            const hook = new Webhook('https://discord.com/api/webhooks/');
            hook.setUsername('Qurre Pay'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
            hook.send(embed);
        }catch{}
    }
}));
router.post('/check/yoomoney', vhost(host, async(req, res) => {
    const data = req.body;
    const hash1 = `${data.notification_type}&${data.operation_id}&${data.amount}&${data.currency}&${data.datetime}&${data.sender}&${data.codepro}&${config.keys.yoomoney.secret}&${data.label}`;
    const crypto = require('crypto')
    const hash = crypto.createHash('sha1').update(hash1).digest('hex');
    if(data.sha1_hash != hash) return res.sendStatus(403);
    if(data.unaccepted == 'true') return res.sendStatus(403);
    const pay = await paymentsData.findOne({code:data.label});
    if(pay == null || pay == undefined) return res.sendStatus(400);
    //if(parseFloat(data.withdraw_amount) != parseFloat(pay.sum/0.98)) return res.sendStatus(403);
    if(pay.paid || pay.canceled) return res.sendStatus(200);
    pay.paid = true;
    pay.method = 'yoomoney';
    await pay.save();
    const statData = await statsData.findOne({shop:pay.shop});
    if(statData != null && statData != undefined){
        statData.success.push(dates.GetStatsDate());
        statData.markModified('success');
        await statData.save();
    }
    const shop = await shopsData.findOne({ id: pay.shop });
    if(shop == null || shop == undefined) return res.sendStatus(400);
    shop.balance += pay.sum;
    await shop.save();
    res.sendStatus(200);
    try{sendNotify.Send(pay.shop, pay)}catch(err){
        const { Webhook } = require('discord-webhook-node');
        const hook = new Webhook("https://discord.com/api/webhooks/");
        hook.setUsername('Payments Web'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
        hook.send(`Произошла ошибка.\nМестоположение: \`Проверка оплаты через телефон\`\nКод ошибки:\n${err}`);
    }
    {
        const { Webhook, MessageBuilder } = require('discord-webhook-node');
        const embed = new MessageBuilder()
        .setTitle('Успешная оплата счета')
        .setAuthor('Qurre Pay', 'https://cdn.scpsl.store/qurre/payments.png', `https://${config.dashboard.baseURL}`)
        .setURL(`https://${config.dashboard.baseURL}/pay/${pay.code}`)
        .setDescription(`Счет выставлен '${shop.name}'`)
        .addField(`Сумма:`, `${pay.sum}₽`, true)
        .addField(`Метод:`, 'YooMoney', true)
        .setColor('#15ff00')
        .setTimestamp();
        try{
            const hook = new Webhook(shop.webhook);
            hook.setUsername('Qurre Pay'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
            hook.send(embed);
        }catch{}
        try{
            const hook = new Webhook('https://discord.com/api/webhooks/');
            hook.setUsername('Qurre Pay'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
            hook.send(embed);
        }catch{}
    }
}));
router.post('/check/crypto', vhost(host, async(req, res) => {
    const data = req.body;
    try{
        const { Webhook } = require('discord-webhook-node');
        const hook = new Webhook("https://discord.com/api/webhooks/");
        hook.setUsername('Payments Web'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
        hook.send(`Тело крипты\n${JSON.stringify(data)}`);
    }catch{}
    console.log(data);
    if(data.status != 'success') return res.sendStatus(403);
    const pay = await paymentsData.findOne({code:data.order_id});
    if(pay == null || pay == undefined) return res.sendStatus(400);
    if(pay.paid || pay.canceled) return res.sendStatus(200);
    pay.paid = true;
    pay.method = `crypto.${data.currency}`;
    await pay.save();
    const statData = await statsData.findOne({shop:pay.shop});
    if(statData != null && statData != undefined){
        statData.success.push(dates.GetStatsDate());
        statData.markModified('success');
        await statData.save();
    }
    const shop = await shopsData.findOne({ id: pay.shop });
    if(shop == null || shop == undefined) return res.sendStatus(400);
    shop.balance += pay.sum;
    await shop.save();
    res.sendStatus(200);
    try{sendNotify.Send(pay.shop, pay)}catch(err){
        const { Webhook } = require('discord-webhook-node');
        const hook = new Webhook("https://discord.com/api/webhooks/");
        hook.setUsername('Payments Web'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
        hook.send(`Произошла ошибка.\nМестоположение: \`Проверка оплаты через телефон\`\nКод ошибки:\n${err}`);
    }
    {
        const { Webhook, MessageBuilder } = require('discord-webhook-node');
        const embed = new MessageBuilder()
        .setTitle('Успешная оплата счета')
        .setAuthor('Qurre Pay', 'https://cdn.scpsl.store/qurre/payments.png', `https://${config.dashboard.baseURL}`)
        .setURL(`https://${config.dashboard.baseURL}/pay/${pay.code}`)
        .setDescription(`Счет выставлен '${shop.name}'`)
        .addField(`Сумма:`, `${pay.sum}₽`, true)
        .addField(`Метод:`, pay.method, true)
        .setColor('#15ff00')
        .setTimestamp();
        try{
            const hook = new Webhook(shop.webhook);
            hook.setUsername('Qurre Pay'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
            hook.send(embed);
        }catch{}
        try{
            const hook = new Webhook('https://discord.com/api/webhooks/');
            hook.setUsername('Qurre Pay'); hook.setAvatar('https://cdn.scpsl.store/qurre/payments.png');
            hook.send(embed);
        }catch{}
    }
}));
module.exports = router;
module.exports = {Init: function(){
    const paymentsData = require("../../base/payments");
    const config = require("../../config");
    const shopsData = require("../../base/shops");
    const statsData = require("../../base/stats");
    const dates = require("./modules/dates");
    const sendNotify = require("./modules/sendNotify");
    async function Check() {
        const _pays = await paymentsData.find({pre_telephone:true});
        for (let i = 0; i < _pays.length; i++) {
            if(_pays[i].paid || _pays[i].canceled) continue;
            if(new Date(_pays[i].pre_telephone_date).getTime() + 1000 * 60 * 60 * 24 * 7 < Date.now()) continue;
            await sleep(1000);
            const pays = await paymentsData.find({pre_telephone:true});
            const pay = await paymentsData.findOne({code:_pays[i].code});
            const prs = {
                from: pay.pre_telephone_date,
                details: true,
                type: 'deposition',
            }
            const pp = await operationHistory(prs);
            if(pp.operations == undefined || pp.operations == null) continue;
            const paysCount = pp.operations.filter(x => x.direction == 'in' && x.amount == pay.sum && x.status == 'success' && x.details.includes('мобильного телефона')
            && x.details.split(',')[0].split(' ')[x.details.split(',')[0].split(' ').length-1] == pay.pre_telephone_number).length;
            if(paysCount == 0) continue;
            if(pays.filter(x => x.pre_telephone_number == pay.pre_telephone_number && x.paid && new Date(x.pre_telephone_date).getTime() >= new Date(pay.pre_telephone_date).getTime()).length >= paysCount) continue;
            pay.paid = true;
            pay.method = 'telephone';
            await pay.save();
            const statData = await statsData.findOne({shop:pay.shop});
            if(statData != null && statData != undefined){
                statData.success.push(dates.GetStatsDate());
                statData.markModified('success');
                await statData.save();
            }
            const shop = await shopsData.findOne({ id: pay.shop });
            if(shop == null || shop == undefined) continue;
            shop.balance += pay.sum;
            await shop.save();
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
                .addField(`Метод:`, 'Телефон', true)
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
        }
    }
    Check();
    setInterval(() => Check(), 60000);
    async function operationHistory(parameters) {
        const response = await fetch('https://yoomoney.ru/api/operation-history', parameters, {
            Authorization: `Bearer ${config.keys.yoomoney.account}`
        });
        const data = await response.json();
        return data;
        async function fetch(url, parameters, headers = {}) {
            const node_fetch = require("node-fetch");
            const querystring = require("querystring");
            return await node_fetch.default(url, {
                method: "POST",
                body: querystring.stringify(parameters),
                headers: {
                    ...headers,
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json"
                }
            });
        }
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}};
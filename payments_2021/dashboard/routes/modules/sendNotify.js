module.exports = {Send: async function(shop_, pay){
    const axios = require('axios');
    const shops = require("../../../base/shops");
    const __shop = await shops.findOne({id: shop_});
    if(__shop == null || __shop == undefined) return;
    const __link = __shop.links.notification;
    axios.post(__link, {payment: pay.code}).catch(async()=>{
        setTimeout(async() => {
            const _shop = await shops.findOne({id: shop_});
            if(_shop == null || _shop == undefined) return;
            const _link = _shop.links.notification;
            await axios.post(_link, {payment: pay.code}).catch(async()=>{
                setTimeout(async() => {
                    const shop = await shops.findOne({id: shop_});
                    if(shop == null || shop == undefined) return;
                    const link = shop.links.notification;
                    try{await axios.post(link, {payment: pay.code})}catch{}
                }, 3300000);
            });
        }, 300000);
    });
}};
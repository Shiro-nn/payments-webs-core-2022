const config = require('./config')
async function Init(){
    const rawResponse = await fetch('https://cryptocloud.plus/api/v2/invoice/create', {
        headers:{
            'Authorization': `Token ${config.keys.crypto.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            shop_id: config.keys.crypto.shop,
            order_id: 'uid666',
            amount: 1,
            currency: 'RUB'
        })
    });
    const content = await rawResponse.json();
    console.log(content);
}
Init();
const request = require('request');
request.post({
  url: 'https://api.tinkoff.ru/v1/payment_commission?origin=web%2Cib5%2Cplatform',
  form: `payParameters=${JSON.stringify({
    currency: 'RUB',
    moneyAmount: '100',
    provider: 'c2c-anytoany',
    cardNumber: '',
    providerFields: {toCardNumber: ''}
  })}`,
}, function(error, response, body) {
	console.log(response.statusCode);
	if(!error && response.statusCode == 200) {
    console.log(body);
		var data = JSON.parse(body);
		console.log(data);
	}
});


request.post('https://api.tinkoff.ru/v1/session?origin=web%2Cib5%2Cplatform', function(error, response, body) {
	console.log(response.statusCode);
	if(!error && response.statusCode == 200) {
    console.log(body);
		var data = JSON.parse(body);
		console.log(data);
    const session = data.payload;

    request.post({
      url: 'https://api.tinkoff.ru/v1/pay?origin=web%2Cib5%2Cplatform',
      form: `sessionid=${session}&payParameters=${JSON.stringify({
        cardNumber: '',
        formProcessingTime: '400',
        securityCode: '000',
        expiryDate: '02/23',
        attachCard: 'false',
        provider: 'c2c-anytoany',
        currency: 'RUB',
        moneyAmount: '100',
        moneyCommission: '100',
        providerFields: {toCardNumber: ''}
    })}`,
    }, function(error, response, body) {
      console.log(response.statusCode);
      if(!error && response.statusCode == 200) {
        console.log(body);
        var data = JSON.parse(body);
        console.log(data);
      }
    });
	}
});

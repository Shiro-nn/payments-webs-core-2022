let request = require('request');
request = request.defaults({jar: true});
const jar = request.jar();
request('https://www.alfaportal.ru/card2card/ptpl/alfaportal/initial.html', function() {
    request({
        url: 'https://www.alfaportal.ru/card2card/fee/alfaportal/',
        method: 'POST',
        jar: jar,
        body: 'tfr_card_src_num=5599&tfr_card_dst_num=2202&tfr_amount=100&tfr_currency=810&tfr_card_src_exp_year=2022&tfr_card_src_exp_month=01'
      /*form: JSON.stringify({
        tfr_amount: "100",
        tfr_card_dst_num: "2202 ",
        tfr_card_src_exp_month: "01",
        tfr_card_src_exp_year: "2022",
        tfr_card_src_num: "5599 ",
        tfr_currency: "810",
      })*/
    }, function(error, response, body) {
        console.log(response);
        console.log(body)
        console.log(jar.getCookieString('https://www.alfaportal.ru/card2card/fee/alfaportal/'));
    });
});
request({
    url: 'https://www.alfaportal.ru/card2card/ptpl/alfaportal/initial.html',
    method: 'POST',
    body: 'tfr_card_src_exp_month=02&tfr_card_src_exp_year=2023&tfr_currency=810&tfr_card_src_num=4890&tfr_card_cvv=400&tfr_surname=&tfr_name=&tfr_middlename=&tfr_city=&tfr_street=&tfr_addr_index=&tfr_card_dst_num=&tfr_surname_recipient=&tfr_name_recipient=&tfr_middlename_recipient=&tfr_amount=20&ssn_token=&service_terms_ok=on&action_proceed='
  /*form: JSON.stringify({
    tfr_amount: "100",
    tfr_card_dst_num: "2202 ",
    tfr_card_src_exp_month: "01",
    tfr_card_src_exp_year: "2022",
    tfr_card_src_num: "5599 ",
    tfr_currency: "810",
  })*/
}, function(error, response, body) {
    console.log(response);
    console.log(body)
});
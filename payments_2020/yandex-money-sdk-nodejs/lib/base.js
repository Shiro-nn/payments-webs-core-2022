var request = require('request');
var querystring = require("querystring");

function Config() {
}

Config.MONEY_URL = "https://money.yandex.ru";

function sendUnauthenticatedRequest(params, callback) {
  var headers = params.headers || {};
  var data = params.data || {};
  var url = params.url;

  headers['User-Agent'] = "Yandex.Money.SDK/NodeJS";

  request.post({
    url: Config.MONEY_URL + url, 
    headers: headers, 
    form: data,
  }, processResponse(callback));
}

function processResponse(callback) {
  return function httpCallback(error, response, body) {
    if(error) {
      callback(error);
      return;
    }
    switch(response.statusCode) {
      case 303:
        callback(new Error("See other location: " + response.headers.location));
        break;    
      case 400: 
        callback(new Error("Format error"));
        break;
      case 401:
        callback(new Error("Token error"));
        break;
      case 403:
        callback(new Error("Scope error"));
        break;
      default: 
        callback(null, JSON.parse(body), response);
    }
  };
}

module.exports = {
  Config: Config,
  sendUnauthenticatedRequest: sendUnauthenticatedRequest,
  processResponse: processResponse
};


let request = require('request');
request = request.defaults({jar: true});
module.exports = {
    Send: function(url, form) {
        return new Promise(resolve => request.post({url:url, form:form}, (error, response, body) => resolve({error, response, body})));
    }
};
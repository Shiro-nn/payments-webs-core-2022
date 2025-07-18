
var EM = {};
module.exports = EM;
const { SMTPClient } =  require('../../../emailjs');
var HM = require('./mails');

EM.server = new SMTPClient(
{
  host 	    : 'smtp.yandex.ru',//smtp.yandex.ru
  user 	    : '',//
  password  : '',//
  ssl		    : true
});
EM.register = function(account, callback)
{
	EM.server.send({
		from         : 'Успешная регистрация <payments@scpsl.store>',
		to           : account.email,
		subject      : 'Успешная регистрация ✔',
		text         : 'что-то пошло не так... :(',
		attachment   : HM.registerEmail(account)
	}, callback );
}
EM.dispatchResetPasswordLink = function(account, callback)
{
  EM.server.send({
    from         : 'Сброс пароля <payments@scpsl.store>',
    to           : account.email,
    subject      : 'Сброс пароля',
    text         : 'что-то пошло не так... :(',
    attachment   : HM.composeEmail(account)
  }, callback );
};
EM.paymentsuc = function(shop, name, email, callback)
{
  EM.server.send({
    from         : 'Успешная покупка <payments@scpsl.store>',
    to           : email,
    subject      : 'Успешная покупка',
    text         : 'что-то пошло не так... :(',
    attachment   : HM.psucEmail(shop, name)
  }, callback );
};


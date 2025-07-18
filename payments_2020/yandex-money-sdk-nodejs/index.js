var wallet = require("./lib/wallet.js");
var externalPayment = require("./lib/external_payment.js");
var base = require("./lib/base.js");

module.exports = {
  Wallet: wallet.Wallet,
  ExternalPayment: externalPayment.ExternalPayment,
  Config: base.Config
};

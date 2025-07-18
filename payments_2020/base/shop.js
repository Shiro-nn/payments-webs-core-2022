const mongoose = require("mongoose"),
Schema = mongoose.Schema,
config = require("../config.js");

module.exports = mongoose.model("shop", new Schema({
    mid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    email: { type: String, default: '' },
    owner: { type: String, default: '' },
    verifykey: { type: String, default: '' },
    verify: { type: Boolean, default: false },
    paymentid: { type: Number, default: 0 },
    payments: { type: Array, default: [] },
    errorlink: { type: String, default: '' },
    suclink: { type: String, default: '' },
    notificationlink: { type: String, default: '' },
    namelink: { type: String, default: '' },
    name: { type: String, default: '' },
    img: { type: String, default: '/shop/img/noimg.png' }
}));

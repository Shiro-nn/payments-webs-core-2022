const mongoose = require("mongoose"),
Schema = mongoose.Schema,
config = require("../config.js");

module.exports = mongoose.model("account", new Schema({
    email: { type: String, default: '' },
    user: { type: String, default: '' },
    pass: { type: String, default: '' },
    date: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    ip: { type: String, default: '' },
    cookie: { type: String, default: '' },
    passKey: { type: String, default: '' },
}));

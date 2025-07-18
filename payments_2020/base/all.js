const mongoose = require("mongoose"),
Schema = mongoose.Schema,
config = require("../config.js");

module.exports = mongoose.model("all", new Schema({
    shopsid: { type: Number, default: 0 }
}));

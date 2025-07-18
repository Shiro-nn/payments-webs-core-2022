const mongoose = require("mongoose"),
Schema = mongoose.Schema;

module.exports = mongoose.model("payments", new Schema({
    id: { type: Number, default: 0 },
    paymentid: { type: Number, default: 0 },
    payments: { type: Array, default: [] }
}));

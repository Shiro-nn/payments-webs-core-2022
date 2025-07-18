const mongoose = require("mongoose");
module.exports = mongoose.model("payments", new mongoose.Schema({
    shop: { type: Number, default: 0 },
    sum: { type: Number, default: 0 },
    id: { type: Number, default: 0 },
    code: { type: String, default: '' },
    desc: { type: String, default: '' },
    method: { type: String, default: '' },
    email: { type: String, default: '' },
    paid: { type: Boolean, default: false },
    canceled: { type: Boolean, default: false },
    pre_telephone: { type: Boolean, default: false },
    pre_telephone_date: { type: String, default: '' },
    pre_telephone_number: { type: String, default: '' },
    card: { type: String, default: '' },
}));
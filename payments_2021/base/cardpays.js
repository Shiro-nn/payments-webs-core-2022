const mongoose = require("mongoose");
module.exports = mongoose.model("cardpays", new mongoose.Schema({
    sum: { type: Number, default: 0 },
    id: { type: String, default: '' },
    pay: { type: String, default: '' },
    desc: { type: String, default: '' },
    paid: { type: Boolean, default: false },
    canceled: { type: Boolean, default: false },
    verify: { type: Object, default:{
        tinkoff:{
            session: '',
            ticket: '',
            req: ''
        }
    }}
}));
const mongoose = require("mongoose"),
Schema = mongoose.Schema;
module.exports = mongoose.model("stats", new Schema({
    shop: { type: Number, default: 0 },
    labels: { type: Array, default: [] },
    success: { type: Array, default: [] },
    canceled: { type: Array, default: [] },
    total: { type: Array, default: [] },
}));
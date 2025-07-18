const mongoose = require("mongoose");

module.exports = mongoose.model("sessions", new mongoose.Schema({
    id: { type: String },
    expires: { type: Date },
    session: { type: String }
}));
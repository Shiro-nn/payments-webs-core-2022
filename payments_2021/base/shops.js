const mongoose = require("mongoose"),
Schema = mongoose.Schema,
config = require("../config.js");
module.exports = mongoose.model("shops", new Schema({
    id: { type: Number, default: 0 },
    owner: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    name: { type: String, default: '' },
    avatar: { type: String, default: `${config.dashboard.cdn}/qurre.store/shops/unknow.png` },
    webhook: { type: String, default: '' },
	links: {
		type: Object,
		default: {
			main: '',
			error: '',
			successfully: '',
			notification: '',
		}
	},
    key_public: { type: String, default: '' },
    key_private: { type: String, default: '' },
    payments: { type: Number, default: 0 },
}));
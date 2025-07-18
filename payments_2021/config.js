module.exports = {
	dashboard: {
		safe: "http",
		baseURL: "localhost",//qurre.store  localhost pay.scpsl.store
		cdn_reserve: "https://mirror.scpsl.store:836",
		cdn: "https://cdn.scpsl.store"//cdn.qurre.store
	},
	keys:{
		qiwi:{
			secret: "=",
			public: "",
		},
		yoomoney:{
			oauth: '',
			account: '',
			secret: '',
			id: '',
		},
		crypto:{
			token: '',
			shop: '',
		},
		cards:{
			tinkoff: '',
			sber: '',
		}
	},
	mongoDB: "@mongo.scpsl.store:27020/qurre-pay?authSource=admin",
	ip:['']
}
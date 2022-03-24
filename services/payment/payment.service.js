const _ = require("lodash");
const Cron = require("moleculer-cron");
const { I18n } = require("i18n");
const path = require("path");
const DIRNAME = __dirname;

module.exports = {
	name: "payment",
	mixins: [Cron],
	version: 1,

	/**
	 * Settings
	 */
	settings: {},

	hooks: {
		before: {
			"*": [
				function setLanguage(ctx) {
					const language =
						_.get(ctx.params, "body.language", "") || "vi";
					this.setLocale(language);
				},
			],
		},
	},

	/**
	 * Dependencies
	 */
	dependencies: [],
	crons: [
		{
			name: "CHECK_ORDER",
			cronTime: "0/5 * * * *", // every 5 minutes
			onTick: async function () {
				await this.call("v1.payment.updateOrderStatus");
			},
			runOnInit: () => {
				console.log("CHECK_ORDER job is created");
			},
			timeZone: "Asia/Ho_Chi_Minh",
		},
	],

	/**
	 * Actions
	 */
	actions: {
		statisticCustomer: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/StatisticCustomer",
				auth: false,
			},
			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
				},
			},
			handler: require("./actions/statisticCustomer.action"),
		},
		exportStatisticTransaction: {
			rest: {
				method: "",
				fullPath: "/v1/External/ExportStatisticTransaction",
				auth: false,
			},
			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
				},
			},
			handler: require("./actions/exportStatisticTransaction.action"),
		},
		statisticTransaction: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/StatisticTransaction",
				auth: false,
			},
			params: {
				body: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
				},
			},
			handler: require("./actions/statisticTransaction.action"),
		},
		urlReturn: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/UrlReturn",
				auth: false,
			},
			params: {
				body: {
					$$type: "object",
					apiMessage: "string",
				},
			},
			handler: require("./actions/urlReturn"),
		},
		createOrder: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/CreateOrder",
				auth: {
					strategies: ["Default"],
					mode: "required", // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: "object",
					paymentMethod: "string",
					note: "string|optional",
					total: "number|positive",
				},
			},
			handler: require("./actions/createOrder.action"),
		},
		getOrder: {
			rest: {
				method: "GET",
				fullPath: "/v1/External/GetOrder/:orderId",
				auth: {
					strategies: ["Default"],
					mode: "required", // 'required', 'optional', 'try'
				},
			},
			handler: require("./actions/getOrder.action"),
		},
		updateOrderStatus: {
			handler: require("./actions/updateOrderStatus.action"),
		},
	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {
		convertData: require("./methods/convertData.method"),
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		this.$i18n = new I18n({
			locales: ["vi", "en"],
			directory: path.join(DIRNAME, "/locales"),
			defaultLocale: "vi",
			register: this,
		});
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {},
};

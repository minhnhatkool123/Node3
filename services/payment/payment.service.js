const _ = require("lodash");
const Cron = require("moleculer-cron");

module.exports = {
	name: "payment",
	mixins: [Cron],
	version: 1,

	/**
	 * Settings
	 */
	settings: {},

	/**
	 * Dependencies
	 */
	dependencies: [],
	crons: [
		{
			name: "CHECK_ORDER",
			cronTime: "0/5 * * * *", // every 5 minutes
			onTick: async function () {
				await this.call('v1.payment.updateOrderStatus')
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
		urlReturn: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/UrlReturn/:orderId",
				auth: false
			},
			params: {
				body: {
					$$type: "object",
					"data-checksum": "string",
					key: "string"
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
				auth: false
			},
			handler: require("./actions/getOrder.action"),
		},
		updateOrderStatus: {
			handler: require("./actions/updateOrderStatus.action"),
		}
	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Service created lifecycle event handler
	 */
	created() { },

	/**
	 * Service started lifecycle event handler
	 */
	async started() { },

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() { },
};

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
			cronTime: "0/1 * * * *", // every minutes
			onTick: async function () {
				console.log("XOA ORDER");
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
					userId: "number",
					paymentMethod: "string",
					note: "string|optional",
					total: "number|positive",
				},
			},
			handler: require("./actions/createOrder.action"),
		},
		searchOrder: {
			rest: {
				method: "POST",
				fullPath: "/v1/External/SearchOrder",
				auth: {
					strategies: ["Default"],
					mode: "required", // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: "object",
					orderId: "number",
				},
			},
			handler: require("./actions/searchOrder.action"),
		},
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
	created() {},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {},
};

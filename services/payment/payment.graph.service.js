const _ = require("lodash");
const Cron = require("moleculer-cron");
const { I18n } = require("i18n");
const path = require("path");
const DIRNAME = __dirname;

module.exports = {
	name: "payment.graph",
	version: 1,

	/**
	 * Settings
	 */
	settings: {
		graphql: {
			type: require("./graphql/type"),
			input: require("./graphql/input"),
			enum: require("./graphql/enum"),
			resolvers: {
				MutationPayment: {
					createOrder: {
						__resolveType: {
							action: "v1.payment.graph.createOrder",
						},
					},
					getOrder: {
						action: "v1.payment.graph.getOrder",
					},
					statisticTransaction: {
						action: "v1.payment.graph.statisticTransaction",
					},
					exportStatisticTransaction: {
						action: "v1.payment.graph.exportStatisticTransaction",
					},
				},
			},
		},
	},

	hooks: {
		before: {
			"*": [
				function setLanguage(ctx) {
					const language =
						_.get(ctx.params, "body.language", "") || "vi";
					this.setLocale(language);
				},
			],
			//createOrder: ["checkUserScope"],
		},
		// error: {
		// 	"*": function (ctx, error) {
		// 		return {
		// 			data: [],
		// 			succeeded: false,
		// 			message: error.message || String(error),
		// 		};
		// 	},
		// },
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		exportStatisticTransaction: {
			params: {
				input: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					paymentMethod: "string|optional",
				},
			},
			handler: require("./actions/exportStatisticTransaction.graph.action"),
		},
		statisticTransaction: {
			params: {
				input: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					paymentMethod: "string|optional",
				},
			},
			handler: require("./actions/statisticTransaction.graph.action"),
		},
		createOrder: {
			params: {
				input: {
					$$type: "object",
					paymentMethod: "string",
					note: "string|optional",
					total: "number|positive",
				},
			},
			// scope: {
			// 	name: "bo.pending.list",
			// 	service: "bo",
			// },
			handler: require("./actions/createOrder.graph.action"),
		},
		getOrder: {
			handler: require("./actions/getOrder.graph.action"),
		},
		graphqlPayment: {
			graphql: {
				query: "QueryPayment: String",
				mutation: "MutationPayment: MutationPayment",
			},
			handler(ctx) {
				return true;
			},
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
		checkUserScope: require("./methods/checkUserScope.method"),
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

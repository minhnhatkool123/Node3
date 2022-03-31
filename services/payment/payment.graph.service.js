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
						action: "v1.payment.graph.createOrder",
					},
					statisticTransaction: {
						action: "v1.payment.graph.statisticTransaction",
					},
					exportStatisticTransaction: {
						action: "v1.payment.graph.exportStatisticTransaction",
					},
					statisticCustomer: {
						action: "v1.payment.graph.statisticCustomer",
					},
					exportStatisticCustomer: {
						action: "v1.payment.graph.exportStatisticCustomer",
					},
				},
				QueryPayment: {
					getOrder: {
						action: "v1.payment.graph.getOrder",
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
			statisticTransaction: ["checkUserScope"],
			exportStatisticTransaction: ["checkUserScope"],
			statisticCustomer: ["checkUserScope"],
			exportStatisticCustomer: ["checkUserScope"],
		},
		error: {
			"*": function (ctx, error) {
				return {
					data: [],
					succeeded: false,
					message: error.message || String(error),
				};
			},
		},
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		exportStatisticCustomer: {
			params: {
				input: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					userId: "number|optional",
				},
			},
			scope: {
				name: "admin.view.stat",
			},
			handler: require("./actions/exportStatisticCustomer.graph.action"),
		},
		statisticCustomer: {
			params: {
				input: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					userId: "number|optional",
				},
			},
			scope: {
				name: "admin.view.stat",
			},
			handler: require("./actions/statisticCustomer.graph.action"),
		},
		exportStatisticTransaction: {
			params: {
				input: {
					$$type: "object",
					fromDate: "string",
					toDate: "string",
					paymentMethod: "string|optional",
				},
			},
			scope: {
				name: "admin.view.stat",
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
			scope: {
				name: "admin.view.stat",
			},
			handler: require("./actions/statisticTransaction.graph.action"),
		},
		createOrder: {
			graphql: {},
			params: {
				input: {
					$$type: "object",
					paymentMethod: "string",
					note: "string|optional",
					total: "number|positive",
				},
			},

			handler: require("./actions/createOrder.graph.action"),
		},
		getOrder: {
			handler: require("./actions/getOrder.graph.action"),
		},
		graphqlPayment: {
			graphql: {
				query: "QueryPayment: QueryPayment",
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

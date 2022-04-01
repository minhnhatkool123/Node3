const _ = require("lodash");
const Cron = require("moleculer-cron");
const { I18n } = require("i18n");
const path = require("path");
const DIRNAME = __dirname;
const moment = require("moment");

moment.tz.setDefault("Asia/Ho_Chi_Minh");

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
					dateTimeTest: {
						action: "v1.payment.graph.dateTimeTest",
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
		dateTimeTest: {
			handler: require("./actions/dateTimeTest"),
		},
		exportStatisticCustomer: {
			scope: {
				name: "admin.view.stat",
			},
			handler: require("./actions/exportStatisticCustomer.action"),
		},
		statisticCustomer: {
			scope: {
				name: "admin.view.stat",
			},
			handler: require("./actions/statisticCustomer.action"),
		},
		exportStatisticTransaction: {
			scope: {
				name: "admin.view.stat",
			},
			handler: require("./actions/exportStatisticTransaction.action"),
		},
		statisticTransaction: {
			scope: {
				name: "admin.view.stat",
			},
			handler: require("./actions/statisticTransaction.action"),
		},
		createOrder: {
			handler: require("./actions/createOrder.action"),
		},
		getOrder: {
			handler: require("./actions/getOrder.action"),
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

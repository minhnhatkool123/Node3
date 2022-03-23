const _ = require("lodash");
const { I18n } = require("i18n");
const path = require("path");
const DIRNAME = __dirname;

module.exports = {
	name: "payWallet",
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

	/**
	 * Actions
	 */
	actions: {
		pay: {
			params: {
				transaction: "string",
				userId: "number",
			},
			handler: require("./actions/pay.action"),
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

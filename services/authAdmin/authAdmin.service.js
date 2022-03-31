module.exports = {
	name: "authAdmin",

	version: 1,

	/**
	 * Settings
	 */
	settings: {},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		isAdmin: {
			registry: {
				auth: {
					name: "Admin",
					jwtKey: process.env.SECRET_KEY_ADMIN,
				},
			},
			handler: require("./actions/admin.action"),
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

	// async stopped() {},

	async afterConnected() {
		this.logger.info("Connected successfully Wallet...");
	},
};

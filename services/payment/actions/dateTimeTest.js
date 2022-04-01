const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const { v1: uuidv1 } = require("uuid");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();
const paymentConstant = require("../constants/paymentConstant");
const moment = require("moment");

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.input;
		console.log("tets time", moment(payload.date).toDate());
		return "AAA";
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

const _ = require("lodash");
const paymentConstant = require("../constants/paymentConstant");
const { MoleculerError } = require("moleculer").Errors;
module.exports = async function (ctx) {
	//let newData = {};
	try {
		if (_.get(ctx, "meta.auth.credentials.userId", null) === null) {
			throw new MoleculerError(
				"Mã khách hàng không tồn tại",
				401,
				null,
				null
			);
		}

		if (_.get(ctx, "meta.auth.data.scope", null) === null) {
			throw new MoleculerError("Bạn không có quyền này", 401, null, null);
		}

		if (_.get(ctx, "action.scope.name", null) === null) {
			throw new MoleculerError("Bạn không có quyền này", 401, null, null);
		}

		let userScope = ctx.meta.auth.data.scope;
		let actionScope = ctx.action.scope.name;
		if (!userScope.includes(actionScope)) {
			throw new MoleculerError("Bạn không có quyền này", 401, null, null);
		}
	} catch (error) {
		throw new MoleculerError(error.message, 401, null, null);
	}
};

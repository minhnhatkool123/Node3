const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		if (_.get(ctx, "meta.auth.credentials.userId", null) === null) {
			return {
				code: 1001,
				message: this.__("Mã khách hàng không tồn tại"),
			};
		}

		const userId = ctx.meta.auth.credentials.userId;
		const { orderId } = ctx.params.input;
		console.log("orderId", orderId);

		const order = await this.broker.call("v1.order.findOne", [
			{
				orderId,
			},
			"-_id",
		]);

		if (_.get(order, "id", null) === null) {
			return {
				code: 1001,
				message: this.__("Đơn hàng không tồn tại"),
			};
		}

		if (userId !== order.userId) {
			return {
				code: 1001,
				message: this.__("Đơn hàng không tồn tại"),
			};
		}

		let userInfo = await this.broker.call(
			"v1.MiniProgramUserModel.findOne",
			[
				{
					id: order.userId,
				},
			]
		);

		if (_.get(userInfo, "id", null) === null) {
			return {
				code: 1001,
				message: this.__("Mã khách hàng không tồn tại"),
			};
		}

		delete order.userId;
		order.orderCreator = {
			userId: userInfo.id,
			name: userInfo.name,
			email: userInfo.email,
		};

		return {
			code: 1000,
			message: this.__("Lấy đơn hàng thành công"),
			order,
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

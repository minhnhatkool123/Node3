const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		if (_.get(ctx, "meta.auth.credentials.userId", null) === null) {
			return {
				code: 1001,
				message: "Không tồn tại userId",
			};
		}

		const userId = ctx.meta.auth.credentials.userId;
		const payload = ctx.params.body;
		const obj = {
			userId: payload.userId,
			paymentMethod: payload.paymentMethod,
			total: payload.total,
		};

		if (userId !== obj.userId) {
			return {
				code: 1001,
				message: "Không tồn tại userId",
			};
		}

		if (!_.isNil(_.get(payload, "note", null))) {
			obj.note = payload.note;
		}

		let orderInfo = null;
		if (obj.paymentMethod === "Wallet") {
			let walletInfo = await this.broker.call("v1.wallet.findOne", [
				{
					userId,
				},
			]);

			if (_.get(walletInfo, "id", null) === null) {
				return {
					code: 1001,
					message: "Kiểm tra ví thất bại",
				};
			}

			if (walletInfo.total < obj.total) {
				return {
					code: 1001,
					message: "Bạn không đủ tiền trong ví",
				};
			}

			orderInfo = await this.broker.call("v1.order.create", [obj]);
			console.log(orderInfo);
			if (_.get(orderInfo, "id", null) === null) {
				return {
					code: 1001,
					message: "Tạo đơn hàng thất bại",
				};
			}

			walletInfo = await this.broker.call("v1.wallet.findOneAndUpdate", [
				{
					userId,
				},
				{
					$inc: {
						total: -obj.total,
					},
					status: "Success",
				},
			]);
			if (_.get(walletInfo, "id", null) === null) {
				return {
					code: 1001,
					message: "Thanh toán bằng ví thất bại",
				};
			}
			return {
				code: 1000,
				message: "Thanh toán bằng ví thành công",
			};
		} else if (obj.paymentMethod === "Atm") {
			console.log("vào ATM thanh toán");
			obj.status = "Pending";
			orderInfo = await this.broker.call("v1.order.create", [obj]);
			if (_.get(orderInfo, "id", null) === null) {
				return {
					code: 1001,
					message: "Tạo đơn hàng thất bại",
				};
			}

			return {
				code: 1000,
				urlThanhToan: "https://www.google.com.vn",
			};
		} else {
			return {
				code: 1001,
				message: "Tạo đơn hàng thất bại",
			};
		}

		// if (_.get(miniProgramCreate, "id", null) === null) {
		// 	return {
		// 		code: 1001,
		// 		message: "Thất bại",
		// 	};
		// }
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const { v1: uuidv1 } = require("uuid");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();
const paymentConstant = require("../constants/paymentConstant");

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
			paymentMethod: payload.paymentMethod,
			total: payload.total,
		};

		if (!_.isNil(_.get(payload, "note", null))) {
			obj.note = payload.note;
		}

		if (obj.total < 5000) {
			return {
				code: 1001,
				message: "Giá đơn hàng phải lớn hơn hoặc bằng 5000",
			};
		}

		let orderInfo = null;
		let uuid = uid(15);
		if (obj.paymentMethod === paymentConstant.PAYMENT_METHOD.WALLET) {
			obj.status = paymentConstant.STATUS.PENDING;
			orderInfo = await this.broker.call("v1.order.create", [
				{
					...obj,
					userId,
					orderId: uid(15),
					transaction: uuid,
					partnerTransaction: "",
				},
			]);

			let payWallet = await this.broker.call("v1.payWallet.pay", {
				transaction: uuid,
				userId,
			});

			if (payWallet.code === 1000) {
				orderInfo = await this.broker.call(
					"v1.order.findOneAndUpdate",
					[
						{
							transaction: uuid,
						},
						{
							status: paymentConstant.STATUS.SUCCESS,
						},
						{ new: true, select: { _id: 0 } },
					]
				);

				return {
					code: 1000,
					message: "Thanh toán bằng ví thành công",
					order: orderInfo,
				};
			} else {
				orderInfo = await this.broker.call(
					"v1.order.findOneAndUpdate",
					[
						{
							transaction: uuid,
						},
						{
							status: paymentConstant.STATUS.CANCELED,
						},
					]
				);

				return {
					code: 1001,
					message: "Thanh toán bằng ví thất bại",
				};
			}
		} else if (obj.paymentMethod === paymentConstant.PAYMENT_METHOD.ATM) {
			console.log("vào ATM thanh toán");
			obj.status = paymentConstant.STATUS.PENDING;
			orderInfo = await this.broker.call("v1.order.create", [
				{
					...obj,
					userId,
					orderId: uid(15),
					transaction: uuid,
				},
			]);
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
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

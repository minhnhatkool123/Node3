const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const { v1: uuidv1 } = require("uuid");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();
const paymentConstant = require("../constants/paymentConstant");

module.exports = async function (ctx) {
	try {
		// console.log("ctx", ctx.action.scope.name);
		// console.log("meta", ctx.meta);

		if (_.get(ctx, "meta.auth.credentials.userId", null) === null) {
			return {
				code: 1001,
				message: this.__("Mã khách hàng không tồn tại"),
				resolveType: "MessageResponse",
			};
		}

		const userId = ctx.meta.auth.credentials.userId;
		const payload = ctx.params.input;
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
				message: this.__("Giá đơn hàng phải lớn hơn hoặc bằng 5000"),
				resolveType: "MessageResponse",
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
					supplierTransaction: "",
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
					message: this.__("Thanh toán thành công"),
					order: orderInfo,
					resolveType: "CreateOrderWALLETMessageResponse",
				};
			} else {
				orderInfo = await this.broker.call(
					"v1.order.findOneAndUpdate",
					[
						{
							transaction: uuid,
						},
						{
							status: paymentConstant.STATUS.FAILED,
						},
					]
				);

				return {
					code: 1001,
					message: this.__("Thanh toán thất bại"),
					resolveType: "MessageResponse",
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
					supplierTransaction: "mn4UupDOhfxbElj", // giả sử bên t3 trả về
				},
			]);
			if (_.get(orderInfo, "id", null) === null) {
				return {
					code: 1001,
					message: this.__("Tạo đơn hàng thất bại"),
					resolveType: "MessageResponse",
				};
			}

			return {
				code: 1000,
				urlThanhToan: "https://www.google.com.vn",
				resolveType: "CreateOrderATMMessageResponse",
			};
		} else {
			return {
				code: 1001,
				message: this.__("Tạo đơn hàng thất bại"),
				resolveType: "MessageResponse",
			};
		}
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const paymentConstant = require("../constants/paymentConstant");
const Moment = require("moment");
const CryptoJS = require("crypto-js");
const NodeRSA = require("node-rsa");
const fs = require("fs");

module.exports = async function (ctx) {
	try {
		//apiMessage U2FsdGVkX1+BmKJPcTl6XY7P7KSSD5MeZB1PXm9XUbVpuZZJiD5i6NLMUI39lr4q58Ko0xcFYo8GSnh03UOBljqDOfyBYN9LVYc2TkHAsuM=
		// {
		//     transaction: "mn4UupDOhfxbElj",  // transaction bên t3 giả sử
		//     status: 'Success',
		//
		//
		//  };

		// apiMessage U2FsdGVkX1/sHxyN/WnIIgVbP+b/w6TQwqD27g0MvZ9nt4mfj8SDo2qt1DBh7tnKxu1WsliI9lyU9KDwTHHfwIQZICCeWyTu2zKirdOVcKA=
		// {
		//     transaction:"mn4UupDOhfxbElj",    // transaction bên t3 giả sử
		//     status: 'Failed',
		//
		//   };

		//const { orderId } = ctx.params.params;
		const { apiMessage } = ctx.params.body;

		let dataDecrypt = JSON.parse(
			CryptoJS.AES.decrypt(
				apiMessage,
				process.env.SECRET_KEY_CHECK
			).toString(CryptoJS.enc.Utf8)
		);

		if (!dataDecrypt) {
			return {
				code: 1001,
				message: this.__("Thông tin mã hóa sai"),
			};
		}

		dataDecrypt = this.convertData(dataDecrypt);
		console.log("dataDecrypt", dataDecrypt);

		let order = await this.broker.call("v1.order.findOne", [
			{
				partnerTransaction: dataDecrypt.partnerTransaction,
			},
		]);

		if (_.get(order, "id", null) === null) {
			return {
				code: 1001,
				message: this.__("Đơn hàng không tồn tại"),
			};
		}

		if (order.status !== paymentConstant.STATUS.PENDING) {
			return {
				code: 1001,
				message: this.__("Đơn hàng không tồn tại"),
			};
		}

		if (Moment(order.createdAt).add(2, "h").isBefore(new Date())) {
			return {
				code: 1001,
				message: this.__("Đơn hàng đã bị hủy"),
			};
		}

		order = await this.broker.call("v1.order.findOneAndUpdate", [
			{
				partnerTransaction: dataDecrypt.partnerTransaction,
			},
			{
				status: dataDecrypt.status,
			},
			{ new: true, select: { _id: 0 } },
		]);

		if (_.get(order, "id", null) === null) {
			return {
				code: 1001,
				message: this.__("Cập nhập đơn hàng thất bại"),
			};
		}

		if (order.status === paymentConstant.STATUS.SUCCESS) {
			return {
				code: 1000,
				message: this.__("Thanh toán thành công"),
				order,
			};
		} else {
			return {
				code: 1001,
				message: this.__("Thanh toán thất bại"),
				order,
			};
		}
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

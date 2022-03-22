const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const Moment = require("moment");
const CryptoJS = require("crypto-js");
const NodeRSA = require("node-rsa");
const fs = require("fs");

module.exports = async function (ctx) {
	try {
		//apiMessage U2FsdGVkX1+0QKQszFVUoOlR3HkWV545SPTuFFZuxIpI713ghLhKPGsROBQeOROfUiGaE5gxzKCGC2UXvYYCfFj7rIDLmSSVvdopCIVj8qJTbseGf7E087rjvZraYEIH
		// {
		//     transaction: uid(10),  // transaction bên t3
		//     status: 'Success',
		//     orderId: '6PU3xovZnKxOLMS',
		//
		//  };

		// apiMessage U2FsdGVkX1+w6fjaeqZ5ecvdr72Mz9UIvbMQzjJ4sSv4oe+ROLcBRU0z0pGWL8i5wLUju7VjHDVMq3CkTftBafQsaFK9qhSzJfIj1mZ2Gg/rektmWcgZQ75gXMvD4Cq7
		// {
		//     transaction: uid(10),    // transaction bên t3
		//     status: 'Failed',
		//     orderId: '6PU3xovZnKxOLMS',
		//   };

		//const { orderId } = ctx.params.params;
		const { apiMessage } = ctx.params.body;

		let checksumDecrypt = JSON.parse(
			CryptoJS.AES.decrypt(
				apiMessage,
				process.env.SECRET_KEY_CHECK
			).toString(CryptoJS.enc.Utf8)
		);
		console.log("checksumDecrypt", checksumDecrypt);

		if (!checksumDecrypt) {
			return {
				code: 1001,
				message: "Cập nhập đơn hàng thất bại",
			};
		}

		//checksumDecrypt = JSON.parse(checksumDecrypt);

		// let order = await this.broker.call("v1.order.findOne", [
		// 	{
		// 		id: orderId,
		// 		status: "Pending",
		// 	},
		// ]);

		// if (_.get(order, "id", null) === null) {
		// 	return {
		// 		code: 1001,
		// 		message: "Không có đơn hàng này",
		// 	};
		// }

		// if (Moment(order.createdAt).add(2, "h").isBefore(new Date())) {
		// 	return {
		// 		code: 1001,
		// 		message: "Đơn hàng đã bị hủy",
		// 	};
		// }

		// order = await this.broker.call("v1.order.findOneAndUpdate", [
		// 	{
		// 		id: orderId,
		// 		status: "Pending",
		// 	},
		// 	{
		// 		status: checksumDecrypt.status,
		// 	},
		// ]);

		// if (_.get(order, "id", null) === null) {
		// 	return {
		// 		code: 1001,
		// 		message: "Cập nhập đơn hàng thất bại",
		// 	};
		// }

		return {
			code: 1000,
			message: "Thanh toán thành công",
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

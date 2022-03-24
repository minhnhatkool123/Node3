const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();
const paymentConstant = require("../constants/paymentConstant");

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
		const where = {
			createdAt: {
				$gte: new Date(`${payload.fromDate}`), //format: 'yyyy-MM-dd'
				$lt: new Date(`${payload.toDate}`), //format: 'yyyy-MM-dd'
			},
		};

		// if (!_.isNil(_.get(payload, "paymentMethod", null))) {
		// 	where.paymentMethod = payload.paymentMethod;
		// }

		// let orders = await this.broker.call("v1.order.aggregate", [
		// 	[
		// 		{
		// 			$match: where,
		// 		},
		// 		{
		// 			$group: {
		// 				_id: {
		// 					date: "$createdAt",
		// 				},
		// 				succeeded: {
		// 					$sum: {
		// 						$cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0],
		// 					},
		// 				},
		// 				pending: {
		// 					$sum: {
		// 						$cond: [{ $eq: ["$status", "PENDING"] }, 1, 0],
		// 					},
		// 				},
		// 				failed: {
		// 					$sum: {
		// 						$cond: [{ $eq: ["$status", "CANCELED"] }, 1, 0],
		// 					},
		// 				},
		// 			},
		// 		},
		// 		{
		// 			$project: {
		// 				_id: 0,
		// 				date: {
		// 					$dateToString: {
		// 						format: "%d/%m/%Y",
		// 						date: "$_id.date",
		// 					},
		// 				},
		// 				succeeded: 1,
		// 				pending: 1,
		// 				failed: 1,
		// 			},
		// 		},
		// 		{
		// 			$sort: { date: 1 },
		// 		},
		// 	],
		// ]);

		let userId = [1, 2, 3, 4, 5];
		let methodArr = ["ATM", "WALLET"];
		let statusArr = ["PENDING", "SUCCESS", "CANCELED"];
		let days = [
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
			20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
		];

		for (let i = 0; i < 20; i++) {
			await this.broker.call("v1.order.create", [
				{
					paymentMethod: methodArr[Math.floor(Math.random() * 2)],
					userId: userId[Math.floor(Math.random() * 5)],
					total: 123456,
					status: statusArr[Math.floor(Math.random() * 3)],
					note: "koko",
					createdAt: new Date(
						`2022-1-${days[Math.floor(Math.random() * 30)]}`
					),
					orderId: uid(15),
					transaction: uid(15),
					supplierTransaction: "",
				},
			]);
		}

		return {
			code: 1000,
			message: "Thành công",
			//orders,
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

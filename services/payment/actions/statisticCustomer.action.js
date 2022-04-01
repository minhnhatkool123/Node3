const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();
const paymentConstant = require("../constants/paymentConstant");

module.exports = async function (ctx) {
	try {
		const payload = ctx.service.name.includes(".graph")
			? ctx.params.input
			: ctx.params.body;
		const where = {
			createdAt: {
				$gte: new Date(`${payload.fromDate}`), //format: 'yyyy-MM-dd'
				$lt: new Date(`${payload.toDate}`), //format: 'yyyy-MM-dd'
			},
		};

		if (!_.isNil(_.get(payload, "userId", null))) {
			where.userId = payload.userId;
		}

		let data = await this.broker.call("v1.order.aggregate", [
			[
				{
					$match: where,
				},
				{
					$group: {
						_id: {
							date: "$createdAt",
							userId: "$userId",
						},
						countCustomers: {
							$sum: 1,
						},
						pending: {
							$sum: {
								$cond: [{ $eq: ["$status", "PENDING"] }, 1, 0],
							},
						},
						failed: {
							$sum: {
								$cond: [{ $eq: ["$status", "FAILED"] }, 1, 0],
							},
						},
					},
				},
				{
					$group: {
						_id: "$_id.date",
						countCustomers: {
							$sum: 1,
						},
						pending: {
							$sum: "$pending",
						},

						failed: {
							$sum: "$failed",
						},
					},
				},
				{
					$project: {
						_id: 0,
						date: {
							$dateToString: {
								format: "%d/%m/%Y",
								date: "$_id",
							},
						},
						countCustomers: 1,
						pending: 1,
						failed: 1,
					},
				},
				{
					$sort: { date: 1 },
				},
			],
		]);

		let dataCustomer = await this.broker.call("v1.order.aggregate", [
			[
				{
					$match: where,
				},
				{
					$group: {
						_id: {
							userId: "$userId",
						},
						succeeded: {
							$sum: {
								$cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0],
							},
						},
						pending: {
							$sum: {
								$cond: [{ $eq: ["$status", "PENDING"] }, 1, 0],
							},
						},
						failed: {
							$sum: {
								$cond: [{ $eq: ["$status", "FAILED"] }, 1, 0],
							},
						},
					},
				},
				{
					$sort: { _id: 1 },
				},
			],
		]);

		if (dataCustomer) {
			let userIdArr = [];
			let userArr = [];
			for (let i = 0; i < dataCustomer.length; i++) {
				userIdArr.push(dataCustomer[i]._id.userId);
			}
			userIdArr = [...new Set(userIdArr)];
			console.log(userIdArr);

			for (const userId of userIdArr) {
				let user = await this.broker.call(
					"v1.MiniProgramUserModel.findOne",
					[
						{
							id: userId,
						},
						"-_id name email id",
					]
				);
				user.userId = user.id;
				delete user.id;
				userArr.push(user);
			}

			for (let i = 0; i < dataCustomer.length; i++) {
				for (let j = 0; j < userArr.length; j++) {
					if (userArr[j].userId === dataCustomer[i]._id.userId) {
						dataCustomer[i].userInfo = userArr[j];
					}
				}
			}
		}

		console.log("dataCustomer", dataCustomer);

		return {
			code: 1000,
			message: this.__("Thành công"),
			data,
			dataCustomer,
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

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

		return {
			code: 1000,
			message: this.__("Thành công"),
			data,
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

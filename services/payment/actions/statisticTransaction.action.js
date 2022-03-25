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

		if (!_.isNil(_.get(payload, "paymentMethod", null))) {
			where.paymentMethod = payload.paymentMethod;
		}

		let orders = await this.broker.call("v1.order.aggregate", [
			[
				{
					$match: where,
				},
				{
					$group: {
						_id: {
							date: "$createdAt",
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
					$project: {
						_id: 0,
						date: {
							$dateToString: {
								format: "%d/%m/%Y",
								date: "$_id.date",
							},
						},
						succeeded: 1,
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
			orders,
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

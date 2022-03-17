const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {

		const { orderId } = ctx.params.params
		console.log(orderId);

		const order = await this.broker.call('v1.order.aggregate', [
			[
				{
					$match: {
						id: parseInt(orderId)
					}
				},
				{
					$lookup: {
						from: "User",
						localField: "userId",
						foreignField: "id",
						as: "user_info",
					},
				},
				{ $unwind: "$user_info" },
				{
					$project: {
						_id: 0,
						orderCreator: {
							userId: "$user_info.id",
							name: "$user_info.name",
							email: "$user_info.email"
						},
						id: 1,
						total: 1,
						paymentMethod: 1,
						status: 1,
					},
				}
			]
		])

		if (_.get(order[0], "id", null) === null) {
			return {
				code: 1001,
				message: "Lấy đơn hàng thất bại",
			};
		}


		return {
			code: 1000,
			message: "Lấy đơn hàng thành công",
			order: order[0]
		};

	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

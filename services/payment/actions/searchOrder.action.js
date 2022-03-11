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

		const page = parseInt(ctx.params.query.page) || 1;
		const limit = parseInt(ctx.params.query.limit) || 10;
		const startIndex = (page - 1) * limit;
		const orderId = ctx.params.body.orderId.toString();
		console.log("page", page);
		console.log("limit", limit);
		console.log("searchText", orderId);

		// let countOrders = await this.broker.call("v1.order.findMany", [
		// 	{
		// 		id: { $regex: orderId },
		// 	},
		// ]);
		//countOrders = Math.ceil(countOrders.length / limit);
		const orders = await this.broker.call("v1.order.findMany", [
			{
				//$text: { $search: orderId },
				paymentMethod: { $regex: "Wallet", $options: "$i" },
			},
			// {
			// 	skip: startIndex,
			// 	limit: limit,
			// },
		]);

		return {
			code: 1000,
			orders,
			//totalPages: countOrders,
			page,
			searchText: orderId,
			message: "Tìm kiếm thành công",
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

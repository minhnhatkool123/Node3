const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const asyncForEach = require('async-await-foreach');
const Moment = require("moment");


module.exports = async function (ctx) {
	try {
		let orders = await this.broker.call('v1.order.findMany', [
			{
				status: 'Pending',
			}
		]);


		orders = orders.filter(order => {
			if (Moment(order.createdAt).add(2, "h").isBefore(new Date())) {
				return order;
			}
		})

		if (orders.length > 0) {
			asyncForEach(orders, async order => {
				await this.broker.call('v1.order.findOneAndUpdate', [{
					id: order.id,
				}, {
					status: 'Canceled',
				}])
			})
		}

	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

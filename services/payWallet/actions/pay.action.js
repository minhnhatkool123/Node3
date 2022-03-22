const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const payWalletConstant = require("../constants/payWalletConstant");
const AsyncLock = require("async-lock");
const lock = new AsyncLock();

module.exports = async function (ctx) {
	try {
		const { transaction, userId } = ctx.params;
		let data = await lock
			.acquire(userId, async () => {
				let wallet = await this.broker.call("v1.wallet.findOne", [
					{
						userId,
					},
				]);

				if (_.get(wallet, "id", null) === null) {
					return {
						code: 1001,
						message: "Không tồn tại ví",
					};
				}

				const order = await this.broker.call("v1.order.findOne", [
					{
						transaction,
					},
				]);

				if (_.get(order, "id", null) === null) {
					return {
						code: 1001,
						message: "Không tồn tại hóa đơn",
					};
				}

				if (wallet.amount < order.total) {
					return {
						code: 1001,
						message: "Không đủ tiền trong ví",
					};
				}

				let walletHistory = await this.broker.call(
					"v1.walletHistory.create",
					[
						{
							transaction,
							userId,
							before: wallet.amount,
							amount: order.total,
							after: wallet.amount - order.total,
							status: payWalletConstant.STATUS.PENDING,
						},
					]
				);

				if (_.get(walletHistory, "id", null) === null) {
					return {
						code: 1001,
						message: "Thanh toán bằng ví thất bại",
					};
				}

				wallet = await this.broker.call("v1.wallet.findOneAndUpdate", [
					{
						userId,
					},
					{
						$inc: {
							amount: -order.total,
						},
					},
				]);

				if (_.get(wallet, "id", null) === null) {
					walletHistory = await this.broker.call(
						"v1.walletHistory.findOneAndUpdate",
						[
							{
								transaction,
							},
							{
								status: payWalletConstant.STATUS.CANCELED,
							},
						]
					);

					return {
						code: 1001,
						message: "Thanh toán bằng ví thất bại",
					};
				}

				walletHistory = await this.broker.call(
					"v1.walletHistory.findOneAndUpdate",
					[
						{
							transaction,
						},
						{
							status: payWalletConstant.STATUS.SUCCESS,
						},
					]
				);

				return {
					code: 1000,
					message: "Thanh toán bằng ví thành công",
				};
			})
			.catch(function (err) {
				console.log(err.message);
				return err.message;
			});
		return data;
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

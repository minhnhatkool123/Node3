const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const Moment = require("moment");

module.exports = async function (ctx) {
    try {
        const { orderId } = ctx.params.params;
        const { status } = ctx.params.body

        if (status !== "Canceled" && status !== "Success") {
            return {
                code: 1001,
                message: "Cập nhập đơn hàng thất bại",
            };
        }

        let order = await this.broker.call("v1.order.findOne", [
            {
                id: orderId,
                status: "Pending"
            }
        ])

        if (_.get(order, "id", null) === null) {
            return {
                code: 1001,
                message: "Không có đơn hàng này",
            };
        }

        if (Moment(order.createdAt).add(2, "h").isBefore(new Date())) {
            return {
                code: 1001,
                message: "Đơn hàng đã bị hủy",
            };
        }

        order = await this.broker.call("v1.order.findOneAndUpdate", [
            {
                id: orderId,
                status: "Pending"
            },
            {
                status,
            }
        ])

        if (_.get(order, "id", null) === null) {
            return {
                code: 1001,
                message: "Cập nhập đơn hàng thất bại",
            };
        }

        return {
            code: 1000,
            message: "Thanh toán thành công",
        };

    } catch (err) {
        if (err.name === "MoleculerError") throw err;
        throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
    }
};

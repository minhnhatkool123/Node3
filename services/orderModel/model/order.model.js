const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const Moment = require("moment");
const orderConstant = require("../constants/orderConstant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		id: {
			type: Number,
			required: true,
			unique: true,
		},
		orderId: {
			type: String,
			required: true,
			unique: true,
		},
		userId: {
			type: Number,
			require: true,
		},
		transaction: {
			type: String,
			require: true,
			unique: true,
		},
		supplierTransaction: {
			type: String,
			require: true,
			unique: true,
		},
		paymentMethod: {
			type: String,
			require: true,
			enum: [
				orderConstant.PAYMENT_METHOD.WALLET,
				orderConstant.PAYMENT_METHOD.ATM,
			],
		},
		note: {
			type: String,
			default: "",
		},
		total: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: [
				orderConstant.STATUS.CANCELED,
				orderConstant.STATUS.PENDING,
				orderConstant.STATUS.SUCCESS,
				orderConstant.STATUS.FAILED,
			],
		},
	},
	{
		collection: "Order",
		versionKey: false,
		timestamps: true,
	}
);

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: "id",
	startAt: 1,
	incrementBy: 1,
});

//Schema.plugin(autoIncrement.plugin, Schema.options.collection);

module.exports = mongoose.model(Schema.options.collection, Schema);

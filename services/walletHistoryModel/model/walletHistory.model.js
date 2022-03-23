const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const walletHistoryConstant = require("../constants/walletHistoryConstant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		id: {
			type: Number,
			required: true,
			unique: true,
		},
		transaction: {
			type: String,
			require: true,
			unique: true,
		},
		walletId: {
			type: Number,
			require: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		before: {
			type: Number,
			required: true,
		},
		after: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			require: true,
			enum: [
				walletHistoryConstant.STATUS.CANCELED,
				walletHistoryConstant.STATUS.PENDING,
				walletHistoryConstant.STATUS.SUCCESS,
			],
		},
	},
	{
		collection: "WalletHistory",
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

const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const Moment = require("moment");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		id: {
			type: Number,
			required: true,
			unique: true,
		},
		userId: {
			type: Number,
			require: true,
		},
		paymentMethod: {
			type: String,
			require: true,
			enum: ["Wallet", "Atm"],
		},
		note: {
			type: String,
			default: "",
		},
		// receiverInfo: {
		// 	name: {
		// 		type: String,
		// 		required: true,
		// 	},
		// 	email: {
		// 		type: String,
		// 		required: true,
		// 	},
		// 	phone: {
		// 		type: String,
		// 		required: true,
		// 	},
		// 	address: {
		// 		type: String,
		// 		required: true,
		// 	},
		// },
		total: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ["Canceled", "Pending", "Success"],
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

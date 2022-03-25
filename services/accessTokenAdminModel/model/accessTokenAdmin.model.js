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
		expiredTime: {
			type: Date,
			default: Moment(new Date()).add(70, "w"),
		},
		userId: {
			type: Number,
			require: true,
		},
		logoutTime: {
			type: Date,
			default: null,
		},
		platform: {
			type: String,
			default: null,
		},
		deviceId: {
			type: Number,
			default: null,
		},
	},
	{
		collection: "AccessTokenAdmin",
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

module.exports = mongoose.model(Schema.options.collection, Schema);

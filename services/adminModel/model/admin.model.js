const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const adminConstant = require("../constants/adminConstant");

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		id: {
			type: Number,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			require: true,
		},
		password: {
			type: String,
			require: true,
		},
		phone: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		gender: {
			type: String,
			enum: [adminConstant.GENDER.MALE, adminConstant.GENDER.FEMALE],
		},
		avatar: {
			type: String,
			require: true,
		},
		type: {
			type: String,
			default: adminConstant.ROLE.ADMIN,
		},
	},
	{
		collection: "Admin",
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

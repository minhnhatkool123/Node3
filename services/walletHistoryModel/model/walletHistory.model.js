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
        walletId: {
            type: Number,
            require: true,
        },
        payment: {
            type: Number,
            required: true,
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

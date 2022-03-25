const _ = require("lodash");
const paymentConstant = require("../constants/paymentConstant");
module.exports = function (data) {
	let newData = {};
	console.log(data);
	newData.supplierTransaction = data.transaction;
	if (data.status === "Success") {
		newData.status = paymentConstant.STATUS.SUCCESS;
	} else if (data.status === "Failed") {
		newData.status = paymentConstant.STATUS.FAILED;
	}

	return newData;
};

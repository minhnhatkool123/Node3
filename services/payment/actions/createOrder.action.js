const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
		const obj = {
			name: payload.fullName,
			phone: payload.phone,
			email: payload.email,
			password: payload.password,
			gender: payload.gender,
			avatar: payload.avatar,
		};

		let userInfo = await this.broker.call(
			"v1.MiniProgramUserModel.findOne",
			[{ $or: [{ email: obj.email }, { phone: obj.phone }] }]
		);

		console.log(userInfo);
		if (_.get(userInfo, "email", null) === obj.email) {
			return {
				code: 1001,
				message: "Thất bại trùng email",
			};
		}

		if (_.get(userInfo, "phone", null) === obj.phone) {
			return {
				code: 1001,
				message: "Thất bại trung sđt",
			};
		}

		// if (userInfo.phone === obj.phone) {
		// 	return {
		// 		code: 1001,
		// 		message: "Thất bại trùng sđt",
		// 	};
		// }

		const hashPassword = await bcrypt.hash(obj.password, 10);
		obj.password = hashPassword;
		let miniProgramCreate = await this.broker.call(
			"v1.MiniProgramUserModel.create",
			[obj]
		);

		if (_.get(miniProgramCreate, "id", null) === null) {
			return {
				code: 1001,
				message: "Thất bại",
			};
		}

		return {
			code: 1000,
			message: "Tạo tài khoản thành công",
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const asyncForEach = require("async-await-foreach");
const cloudinary = require("cloudinary");

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_KEY,
	api_secret: process.env.CLOUD_SECRET,
});

module.exports = async function (ctx) {
	try {
		if (Array.isArray(global.FileIdArr) && global.FileIdArr.length > 0) {
			asyncForEach(global.FileIdArr, async (fileId) => {
				await cloudinary.v2.uploader.destroy(
					fileId,
					{
						resource_type: "raw",
					},
					function (error, result) {
						if (error) return;
						global.FileIdArr.splice(
							global.FileIdArr.indexOf(fileId),
							1
						);
					}
				);
			});
		}
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

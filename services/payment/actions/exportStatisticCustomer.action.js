const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary");
const ShortUniqueId = require("short-unique-id");
const uid = new ShortUniqueId();

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_KEY,
	api_secret: process.env.CLOUD_SECRET,
});

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
		let uploadFileToCloudinary;
		const where = {
			createdAt: {
				$gte: new Date(`${payload.fromDate}`), //format: 'yyyy-MM-dd'
				$lt: new Date(`${payload.toDate}`), //format: 'yyyy-MM-dd'
			},
		};

		if (!_.isNil(_.get(payload, "userId", null))) {
			where.userId = payload.userId;
		}

		let data = await this.broker.call("v1.order.aggregate", [
			[
				{
					$match: where,
				},
				{
					$group: {
						_id: {
							//date: "$createdAt",
							userId: "$userId",
						},
						succeeded: {
							$sum: {
								$cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0],
							},
						},
						pending: {
							$sum: {
								$cond: [{ $eq: ["$status", "PENDING"] }, 1, 0],
							},
						},
						failed: {
							$sum: {
								$cond: [{ $eq: ["$status", "FAILED"] }, 1, 0],
							},
						},
					},
				},
				{
					$sort: { _id: 1 },
				},
			],
		]);

		if (data) {
			let userIdArr = [];
			let userArr = [];
			for (let i = 0; i < data.length; i++) {
				userIdArr.push(data[i]._id.userId);
			}
			userIdArr = [...new Set(userIdArr)];
			console.log(userIdArr);

			for (const userId of userIdArr) {
				let user = await this.broker.call(
					"v1.MiniProgramUserModel.findOne",
					[
						{
							id: userId,
						},
						"-_id name email id",
					]
				);
				userArr.push(user);
			}

			for (let i = 0; i < data.length; i++) {
				for (let j = 0; j < userArr.length; j++) {
					if (userArr[j].id === data[i]._id.userId) {
						data[i].userInfo = userArr[j];
					}
				}
			}

			console.log("vào tạo excel");
			const workbook = new ExcelJS.Workbook();
			workbook.views = [
				{
					x: 0,
					y: 0,
					width: 10000,
					height: 20000,
					firstSheet: 0,
					activeTab: 0,
					visibility: "visible",
				},
			];
			const sheet = workbook.addWorksheet("Overview", {
				views: [{ showGridLines: true, zoomScale: 100 }],
			});
			sheet.style;

			sheet.getRow(2).height = 20;
			sheet.mergeCells("A1:B1");
			sheet.getCell("A1").value = "TÊN";

			sheet.mergeCells("C1:D1");
			sheet.getCell("C1").value = `USER ID`;

			sheet.mergeCells("E1:F1");
			sheet.getCell("E1").value = `EMAIL`;

			sheet.mergeCells("G1:H1");
			sheet.getCell("G1").value = `TỔNG SỐ GD`;

			sheet.mergeCells("I1:J1");
			sheet.getCell("I1").value = `SỐ GD THÀNH CÔNG`;

			let rowExcel = 2;
			data.forEach((order) => {
				sheet.getRow(rowExcel).height = 20;
				sheet.mergeCells(`A${rowExcel}:B${rowExcel}`);
				sheet.getCell(`A${rowExcel}`).value = order.userInfo.name;

				sheet.mergeCells(`C${rowExcel}:D${rowExcel}`);
				sheet.getCell(`C${rowExcel}`).value = order.userInfo.id;

				sheet.mergeCells(`E${rowExcel}:F${rowExcel}`);
				sheet.getCell(`E${rowExcel}`).value = order.userInfo.email;

				sheet.mergeCells(`G${rowExcel}:H${rowExcel}`);
				sheet.getCell(`G${rowExcel}`).value =
					order.succeeded + order.pending + order.failed;

				sheet.mergeCells(`I${rowExcel}:J${rowExcel}`);
				sheet.getCell(`I${rowExcel}`).value = order.succeeded;

				rowExcel++;
			});

			const pathFile = path.join(
				__dirname,
				`../upload/statisticCustomer${uid(10)}.xlsx`
			);
			await workbook.xlsx.writeFile(pathFile);

			if (fs.existsSync(pathFile)) {
				uploadFileToCloudinary = await cloudinary.v2.uploader.upload(
					pathFile,
					{
						resource_type: "raw",
					}
				);

				fs.unlink(pathFile, (err) => {
					if (err) throw err;
					console.log("successfully deleted");
				});
			} else {
				return {
					code: 1001,
					message: this.__("Thất bại"),
				};
			}

			if (_.get(uploadFileToCloudinary, "secure_url", null) === null) {
				return {
					code: 1001,
					message: this.__("Thất bại"),
				};
			}

			return {
				code: 1000,
				message: this.__("Thành công"),
				url: uploadFileToCloudinary.secure_url,
			};
		}

		return {
			code: 1001,
			message: this.__("Không có dữ liệu"),
			data,
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

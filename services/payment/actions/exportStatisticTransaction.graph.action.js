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
		const payload = ctx.params.input;
		let uploadFileToCloudinary;
		const where = {
			createdAt: {
				$gte: new Date(`${payload.fromDate}`), //format: 'yyyy-MM-dd'
				$lt: new Date(`${payload.toDate}`), //format: 'yyyy-MM-dd'
			},
		};

		if (!_.isNil(_.get(payload, "paymentMethod", null))) {
			where.paymentMethod = payload.paymentMethod;
		}

		let orders = await this.broker.call("v1.order.aggregate", [
			[
				{
					$match: where,
				},
				{
					$group: {
						_id: {
							date: "$createdAt",
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
					$project: {
						_id: 0,
						date: {
							$dateToString: {
								format: "%Y/%m/%d",
								date: "$_id.date",
							},
						},
						succeeded: 1,
						pending: 1,
						failed: 1,
					},
				},
				{
					$sort: { date: 1 },
				},
			],
		]);

		if (orders) {
			console.log("vào tạo excel");
			const workbook =
				new ExcelJS.Workbook(); /*new ExcelJS.stream.xlsx.WorkbookWriter({});*/
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

			sheet.getRow(2).height = 20;
			sheet.mergeCells("A1:B1");
			sheet.getCell("A1").value = "NGÀY";

			sheet.mergeCells("C1:D1");
			sheet.getCell("C1").value = `TỔNG SL GD`;

			sheet.mergeCells("E1:F1");
			sheet.getCell("E1").value = `SL GD THÀNH CÔNG`;

			let rowExcel = 2;
			orders.forEach((rowData) => {
				sheet.getRow(rowExcel).height = 20;
				sheet.mergeCells(`A${rowExcel}:B${rowExcel}`);
				sheet.getCell(`A${rowExcel}`).value = rowData.date;

				sheet.mergeCells(`C${rowExcel}:D${rowExcel}`);
				sheet.getCell(`C${rowExcel}`).value =
					rowData.succeeded + rowData.failed + rowData.pending;

				sheet.mergeCells(`E${rowExcel}:F${rowExcel}`);
				sheet.getCell(`E${rowExcel}`).value = rowData.succeeded;

				rowExcel++;
			});

			const pathFile = path.join(
				__dirname,
				`../upload/statisticTransaction${uid(10)}.xlsx`
			);
			await workbook.xlsx.writeFile(pathFile);

			//uploadFileToCloudinary = await workbook.xlsx.writeBuffer();

			// if (fs.existsSync(pathFile)) {
			// 	uploadFileToCloudinary = await cloudinary.v2.uploader.upload(
			// 		pathFile,
			// 		{
			// 			resource_type: "raw",
			// 		}
			// 	);

			// 	fs.unlink(pathFile, (err) => {
			// 		if (err) throw err;
			// 		console.log("successfully deleted");
			// 	});
			// } else {
			// 	return {
			// 		code: 1001,
			// 		message: this.__("Thất bại"),
			// 	};
			// }

			// if (_.get(uploadFileToCloudinary, "secure_url", null) === null) {
			// 	return {
			// 		code: 1001,
			// 		message: this.__("Thất bại"),
			// 	};
			// }

			// console.log(
			// 	"uploadFileToCloudinary",
			// 	uploadFileToCloudinary
			// 	//uploadFileToCloudinary
			// 	// JSON.parse(uploadFileToCloudinary)
			// );

			await cloudinary.v2.uploader.destroy(
				"w7xqpv9eflyze4yxgl9j.xlsx",
				{
					resource_type: "raw",
				},
				function (error, result) {
					console.log(result, error);
				}
			);

			return {
				code: 1000,
				message: this.__("Thành công"),
				//url: uploadFileToCloudinary.secure_url,
				//dataBuffer: uploadFileToCloudinary,
			};
		}

		return {
			code: 1000,
			message: this.__("Không có dữ liệu"),
			orders,
		};
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

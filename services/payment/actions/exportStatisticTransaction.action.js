const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
		const where = {
			createdAt: {
				$gte: new Date(`${payload.fromDate}`), //format: 'yyyy-MM-dd'
				$lt: new Date(`${payload.toDate}`), //format: 'yyyy-MM-dd'
			},
		};

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
								$cond: [{ $eq: ["$status", "CANCELED"] }, 1, 0],
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
			sheet.getCell("A1").font = {
				name: "Arial",
				size: 10,
				bold: true,
			};
			sheet.getCell("A1").alignment = {
				vertical: "middle",
				horizontal: "center",
			};

			sheet.mergeCells("C1:D1");
			sheet.getCell("C1").value = `TỔNG SL GD`;
			sheet.getCell("C1").font = {
				name: "Arial",
				size: 10,
				bold: true,
			};
			sheet.getCell("C1").alignment = {
				vertical: "middle",
				horizontal: "center",
			};

			sheet.mergeCells("E1:F1");
			sheet.getCell("E1").value = `SL GD THÀNH CÔNG`;
			sheet.getCell("E1").font = {
				name: "Arial",
				size: 10,
				bold: true,
			};
			sheet.getCell("E1").alignment = {
				vertical: "middle",
				horizontal: "center",
			};

			let rowExcel = 2;
			orders.forEach((rowData) => {
				sheet.getRow(rowExcel).height = 20;
				sheet.mergeCells(`A${rowExcel}:B${rowExcel}`);
				sheet.getCell(`A${rowExcel}`).value = rowData.date;
				sheet.getCell(`A${rowExcel}`).font = {
					name: "Arial",
					size: 10,
				};
				sheet.getCell(`A${rowExcel}`).alignment = {
					vertical: "middle",
					horizontal: "left",
				};

				sheet.mergeCells(`C${rowExcel}:D${rowExcel}`);
				sheet.getCell(`C${rowExcel}`).value =
					rowData.succeeded + rowData.failed + rowData.pending;
				sheet.getCell(`C${rowExcel}`).font = {
					name: "Arial",
					size: 10,
				};
				sheet.getCell(`C${rowExcel}`).alignment = {
					vertical: "middle",
					horizontal: "left",
				};

				sheet.mergeCells(`E${rowExcel}:F${rowExcel}`);
				sheet.getCell(`E${rowExcel}`).value = rowData.succeeded;
				sheet.getCell(`E${rowExcel}`).font = {
					name: "Arial",
					size: 10,
				};
				sheet.getCell(`E${rowExcel}`).alignment = {
					vertical: "middle",
					horizontal: "left",
				};

				rowExcel++;
			});

			sheet.commit();

			let dataVip = await workbook.commit();

			// new Promise((resolve, reject) => {
			// 	workbook.commit().then(() => {
			// 		const stream = workbook.stream;
			// 		const res = stream.read();
			// 		resolve(res);
			// 	});
			// });

			// await workbook.commit().then(() => {
			// 	const stream = workbook.stream;
			// 	const res = stream.read();
			// 	return res;
			// });

			let data = await workbook.stream.read();

			// console.log("__dirname", __dirname);
			// const time = new Date().getTime();
			// const pathFile = path.join(
			// 	__dirname,
			// 	`../upload/statisticTransaction${time}.xlsx`
			// );
			// await workbook.xlsx.writeFile(pathFile);

			// if (!fs.existsSync(pathFile)) {
			// 	return {
			// 		code: 1001,
			// 		message: "Tạo file excel thất bại",
			// 	};
			// }

			return {
				code: 1000,
				data,
			};
		}

		// return {
		// 	code: 1000,
		// 	message: "Thành công",
		// 	orders,
		// };
	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
	}
};

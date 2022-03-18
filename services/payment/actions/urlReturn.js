const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const Moment = require("moment");
const CryptoJS = require("crypto-js");
const NodeRSA = require('node-rsa');
const fs = require("fs")


module.exports = async function (ctx) {
    try {
        // đấy là key: DGHzJdwYTnN5JAfQUCupGyoHc9uEtCCt9DqofVb69HDYZGyimj5DPBirlOjZKOFEYPda76C3zJPgavC0lK9jWzywmfQ42XixQ24hVwpXVIU/opD7mXZLBV18FdUfcgceqkeFlsZynHFCUKlXuU4OpCf4e4dhtSO/kZb+7nqaUb8=
        // dc mã hóa bằng 1 public key, public key do bên mình cung cấp cho bên t3 sử dụng (NodeRSA) 
        // khi giải mã ra sẽ được secretKey để giải mã AES
        // để giải mã chúng ta sẽ dùng private key trong thư mục key

        //CryptoJS.AES.encrypt(JSON.stringify(data-checksum), 'PAYME').toString();
        //giả sử data-checksum bên t3 trả về là 
        //data-checksum:  U2FsdGVkX1/nEE8XQYxm+WzBW/BjW+czYLw9PKEcgZr3na81bQRmkYvmfhzN641H   có giá trị { status:"Success"}
        //data-checksum:  U2FsdGVkX1+4BMb5iXl0QJzZI2UCjY2njveTVltFCQuQZ3hCqB8FmX3dV0OPXrVY   có giá trị { status: "Canceled" }

        const { orderId, } = ctx.params.params;
        const payload = ctx.params.body
        const checksum = payload["data-checksum"]
        const secretKey = fs.readFileSync(`${process.cwd().replace(/\\/g, '/')}/keys/private.pem`, "utf8")

        let key_private = new NodeRSA(secretKey)
        let decryptedData = key_private.decrypt(payload.key, "utf8")
        console.log(decryptedData);

        let checksumDecrypt = CryptoJS.AES.decrypt(checksum, decryptedData).toString(CryptoJS.enc.Utf8);
        console.log("checksumDecrypt", checksumDecrypt)

        if (!checksumDecrypt) {
            return {
                code: 1001,
                message: "Cập nhập đơn hàng thất bại",
            };
        }

        checksumDecrypt = JSON.parse(checksumDecrypt)

        let order = await this.broker.call("v1.order.findOne", [
            {
                id: orderId,
                status: "Pending"
            }
        ])

        if (_.get(order, "id", null) === null) {
            return {
                code: 1001,
                message: "Không có đơn hàng này",
            };
        }

        if (Moment(order.createdAt).add(2, "h").isBefore(new Date())) {
            return {
                code: 1001,
                message: "Đơn hàng đã bị hủy",
            };
        }

        order = await this.broker.call("v1.order.findOneAndUpdate", [
            {
                id: orderId,
                status: "Pending"
            },
            {
                status: checksumDecrypt.status
            }
        ])

        if (_.get(order, "id", null) === null) {
            return {
                code: 1001,
                message: "Cập nhập đơn hàng thất bại",
            };
        }

        return {
            code: 1000,
            message: "Thanh toán thành công",
        };

    } catch (err) {
        if (err.name === "MoleculerError") throw err;
        throw new MoleculerError(`[MiniProgram] Add: ${err.message}`);
    }
};

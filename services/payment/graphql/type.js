const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	type MutationPayment {
		createOrder(input: CreateOrderInfo!): CreateOrderMessageResponse!
		getOrder(input: OrderId!): GetOrderMessageResponse!
		statisticTransaction(
			input: StatisticTransactionInfo!
		): StatisticTransactionMessageResponse!

		exportStatisticTransaction(
			input: StatisticTransactionInfo!
		): StatisticTransactionMessageResponse!
	}

	type QueryPayment {
		_: String
	}

	type StatisticTransactionMessageResponse {
		code: Int
		message: String
		dataBuffer: [String]!
		orders: [StatisticTransaction]!
	}

	type StatisticTransaction {
		succeeded: Int
		pending: Int
		failed: Int
		date: String
	}

	union CreateOrderMessageResponse =
		  CreateOrderATMMessageResponse
		| CreateOrderWALLETMessageResponse

	type CreateOrderATMMessageResponse {
		code: Int
		message: String
		urlThanhToan: String
	}

	type CreateOrderWALLETMessageResponse {
		code: Int
		message: String
		order: GetOrder
	}

	type GetOrderMessageResponse {
		code: Int
		message: String
		order: GetOrder
	}

	type GetOrder {
		note: String
		paymentMethod: String
		total: Float
		status: StatusPayment
		orderId: String
		transaction: String
		supplierTransaction: String
		createdAt: String
		id: Int
		orderCreator: OrderCreator
	}

	type OrderCreator {
		userId: Int
		name: String
		email: String
	}
`;

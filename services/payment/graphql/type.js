const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	type MutationPayment {
		createOrder(input: CreateOrderInput!): CreateOrderMessageResponse!

		statisticTransaction(
			input: StatisticTransactionInput!
		): StatisticTransactionMessageResponse!

		exportStatisticTransaction(
			input: StatisticTransactionInput!
		): StatisticTransactionMessageResponse!

		statisticCustomer(
			input: StatisticCustomerInput
		): StatisticCustomerMessageResponse!

		exportStatisticCustomer(
			input: StatisticCustomerInput
		): StatisticCustomerMessageResponse!
	}

	type QueryPayment {
		getOrder(input: OrderId!): GetOrderMessageResponse!
	}

	type StatisticTransactionMessageResponse {
		code: Int
		message: String
		url: String
		orders: [StatisticTransaction]!
	}

	type StatisticCustomerMessageResponse {
		code: Int
		message: String
		url: String
		data: [StatisticCustomer]!
		dataCustomer: [dataCustomer]!
	}

	type dataCustomer {
		userInfo: OrderCreator
		pending: Int
		succeeded: Int
		failed: Int
	}

	type StatisticCustomer {
		countCustomers: Int
		pending: Int
		failed: Int
		date: String
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
		| MessageResponse

	type CreateOrderATMMessageResponse {
		code: Int
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

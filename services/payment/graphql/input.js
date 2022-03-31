const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	input CreateOrderInput {
		paymentMethod: PaymentMethod!
		note: String
		total: Float!
	}

	input OrderId {
		orderId: String
	}

	input StatisticTransactionInput {
		fromDate: String!
		toDate: String!
		paymentMethod: PaymentMethod
	}

	input StatisticCustomerInput {
		fromDate: String!
		toDate: String!
		userId: Int
	}
`;

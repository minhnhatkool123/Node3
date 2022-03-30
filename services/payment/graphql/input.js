const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	input CreateOrderInfo {
		paymentMethod: PaymentMethod!
		note: String
		total: Float!
	}

	input OrderId {
		orderId: String
	}

	input StatisticTransactionInfo {
		fromDate: String!
		toDate: String!
		paymentMethod: PaymentMethod
	}
`;

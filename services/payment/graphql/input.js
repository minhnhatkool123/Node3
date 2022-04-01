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
		fromDate: DateTime!
		toDate: DateTime!
		paymentMethod: PaymentMethod
	}

	input StatisticCustomerInput {
		fromDate: DateTime!
		toDate: DateTime!
		userId: Int
	}

	input TestDateInput {
		date: DateTime
	}
`;

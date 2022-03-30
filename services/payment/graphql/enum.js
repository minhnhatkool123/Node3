const gql = require("moleculer-apollo-server").moleculerGql;

module.exports = gql`
	enum PaymentMethod {
		ATM
		WALLET
	}

	enum StatusPayment {
		CANCELED
		PENDING
		SUCCESS
		FAILED
	}
`;

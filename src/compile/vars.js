const NODE_ENV = process.env.NODE_ENV || 'development';
const production = NODE_ENV === 'production' ? true : false;

const vars = {
	server: production ? 'https://jata.ru' : 'http://dev.jata.ru',
	api	: {
		becomeDriver: '/api/v1/accounts/becomedriver',
		gallery		: '/api/v1/gallery',
	},
};

module.exports = vars;
const vars = {
	production	: false,
	server		: '',
	
	api: {
		becomeDriver: '/api/v1/accounts/becomedriver',
		gallery		: '/api/v1/gallery',
	},

	init() {
		this.server = this.production ? 'https://jata.ru' : 'http://dev.jata.ru';
	},
};

module.exports = vars;
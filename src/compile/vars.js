const vars = {
	production	: 'environment' === 'production',
	server		: '',
	
	api: {
		becomeDriver: '/api/v1/accounts/becomedriver',
		gallery		: '/api/v1/gallery',
	},

	init() {
		this.server = this.production ? 'https://jata.ru' : 'http://dev.jata.ru';
		console.log(this.production)
	},
};

module.exports = vars;
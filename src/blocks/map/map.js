const map = {
	init() {
		$('#map').lazyload({
			threshold: 200,
			effect	: 'fadeIn',
		});
	},
};

module.exports = map;
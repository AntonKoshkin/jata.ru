/* global $ */

const map = {
	/**
	 * инит функция
	 */
	init() {
		$('#map').lazyload({
			threshold: 200,
			effect   : 'fadeIn',
		});
	},
};

module.exports = map;

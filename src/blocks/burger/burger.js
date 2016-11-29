/* global $ */

const burger = {
	/**
	 * инит функция
	 */
	init() {
		$('body').on('click', '.burger', () => {
			$('.navigation').toggleClass('navigation--open');
		});
	},
};

module.exports = burger;

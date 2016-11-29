/* global $ */

const slidePack = {
	/**
	 * инит функция
	 */
	init() {
		$('body').on('click', '[data-pag-pos]', function(event) {
			event.preventDefault();

			$(this)
				.addClass('slide-pack__pag--active')
				.siblings()
				.removeClass('slide-pack__pag--active')
				.closest('.slide-pack__pags')
				.siblings('[data-slider-pos]')
				.attr('data-slider-pos', $(this).attr('data-pag-pos'));
		});
	},
};

module.exports = slidePack;

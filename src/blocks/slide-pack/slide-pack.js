const slidePack = {
	init() {
		$('body').on('click', '[data-pag-pos]', event => {
			event.preventDefault();

			$(event.target)
				.addClass('slide-pack__pag--active')
				.siblings()
				.removeClass('slide-pack__pag--active')
				.closest('.slide-pack__pags')
				.siblings('[data-slider-pos]')
				.attr('data-slider-pos', $(event.target).attr('data-pag-pos'));
		});
	},
};

module.exports = slidePack;
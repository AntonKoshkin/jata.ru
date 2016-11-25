const wdSlider = {
	/**
	 * запускаемая при загрузке функция
	 */
	init() {
		$('body').on('click', '.wd-slider__pag', function(event) {
			event.preventDefault();

			$(this)
				.addClass('wd-slider__pag--active')
				.siblings()
				.removeClass('wd-slider__pag--active');
				
			if ($(this).index() === 1) {
				$(this)
					.closest('.wd-slider')
					.addClass('wd-slider--two');
			} else {
				$(this)
					.closest('.wd-slider')
					.removeClass('wd-slider--two');
			}
		});
	},
};

module.exports = wdSlider;
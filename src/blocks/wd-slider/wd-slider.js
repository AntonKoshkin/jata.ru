const wdSlider = {
	init() {
		$('body').on('click', '.wd-slider__pag', event => {
			const elem = event.target;
			event.preventDefault();

			$(elem)
				.addClass('wd-slider__pag--active')
				.siblings()
				.removeClass('wd-slider__pag--active');
				
			if ($(elem).index() === 1) {
				$(elem)
					.closest('.wd-slider')
					.addClass('wd-slider--two');
			} else {
				$(elem)
					.closest('.wd-slider')
					.removeClass('wd-slider--two');
			}
		});
	},
};

module.exports = wdSlider;
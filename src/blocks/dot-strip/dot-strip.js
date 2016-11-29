/* global $ */

const dotStrip = {
	/**
	 * инит функция
	 */
	init() {
		$('body').on('click', '.dot-strip__input', function() {
			switch ($(this).attr('id')) {
				case 'dotCar':
					$('.dot-strip__runner').attr('data-pos', 'one');
					break;

				case 'dotLorry':
					$('.dot-strip__runner').attr('data-pos', 'two');
					break;

				case 'dotBus':
					$('.dot-strip__runner').attr('data-pos', 'three');
					break;

				// skip default
			}

			$(this)
				.closest('.slider')
				.find('.slide-pack')
				.attr('data-slider-pos', $(this).attr('data-dot-pos'));
		});
	},
};

module.exports = dotStrip;

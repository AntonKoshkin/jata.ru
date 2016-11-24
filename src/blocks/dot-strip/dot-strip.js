const dotStrip = {
	init() {
		$('body').on('click', '.dot-strip__input', event => {
			switch ($(event.target).attr('id')) {
				case 'dotCar':
					$('.dot-strip__runner').attr('data-pos', 'one');
					break;
				case 'dotLorry':
					$('.dot-strip__runner').attr('data-pos', 'two');
					break;
				case 'dotBus':
					$('.dot-strip__runner').attr('data-pos', 'three');
					break;
			}

			$(event.target)
				.closest('.slider')
				.find('.slide-pack')
				.attr('data-slider-pos', $(event.target).attr('data-dot-pos'));
		});
	},
};

module.exports = dotStrip;
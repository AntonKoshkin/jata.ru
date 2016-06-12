$('body').on('click', '.dot-strip__input', function(event) {
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
	}

	$(this)
		.closest('.slider')
		.find('.slide-pack')
		.attr('data-slider-pos', $(this).attr('data-dot-pos'));
});
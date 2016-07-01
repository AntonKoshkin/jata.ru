$('body').on('click', '.select__input', function(event) {
	if (!$(this).closest('.select--open').length) {
		$('.select--open')
			.removeClass('select--open');

		$(this)
			.closest('.select')
			.addClass('select--open');
	} else {
		$(this)
			.closest('.select')
			.removeClass('select--open');
	}
});

$('body').on('click', '.select__variant', function(event) {
	
	if ($(this).closest('.select').find('input').attr('id') !== 'car_brand') {
		$(this)
			.closest('.select__variants')
			.siblings('.select__input')
			.val($(this).text())
			.attr('data-val', $(this).attr('data-val'))
			.attr('data-id', $(this).attr('data-id'))
			.attr('data-correct', 'null')
			.closest('.select')
			.removeClass('select--open');
	} else {
		$.ajax({
			url: 'http://jata.ru:80/api/v1/vehicles/brands/'+$(this).attr('data-id')+'/',
			type: 'GET',
			dataType: 'json',
			// data: {pk: $('#car_brand').attr('data-val')},
		})
		.done(function(data) {
			console.log('got ' + data.models.length + ' models');

			$('[data-content=\'models\']')
				.html('');

			if (data.models.length > 0) {
				data.models.forEach(function(element, index) {
					$('[data-content=\'models\']')
						.append('<li class=\'select__variant\' data-val=\''+element.name+'\' data-id=\''+element.id+'\'>'+element.name+'</li>');
				});
			} else {
				$('[data-content=\'models\']')
					.append('<li class=\'select__variant\' data-val=\'none\'>Марок не найдено</li>');
			}
		})
		.fail(function() {
			console.log('error on getting models');
		});

		$(this)
			.closest('.select__variants')
			.siblings('.select__input')
			.val($(this).text())
			.attr('data-val', $(this).attr('data-val'))
			.attr('data-id', $(this).attr('data-id'))
			.attr('data-correct', 'null')
			.closest('.select')
			.removeClass('select--open');

		$('#car_model')
			.val($('#car_model').attr('data-placeholder'))
			.attr('data-val', 'none');
	}
});
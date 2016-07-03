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

			carModels = data.models;

			return carModels;
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

$('body').on('keyup', '.select__input', function(event) {
	if ($(this).siblings('.select__variants').attr('data-content') === 'brands') {

		$('[data-content=\'brands\']').html('');

		var thisVal = $(this).val();

		carBrands.forEach(function(element, index) {
			if (element.name.toLowerCase().indexOf($('[data-content=\'brands\']').prev('input').val()) !== -1) {
				$('[data-content=\'brands\']')
					.append('<li class=\'select__variant\' data-id=\''+
						element.id+
						'\' data-val=\''+
						element.name+
						'\'>'+
						element.name+
						'</li>');
			}
		});

		if (!$('[data-content=\'brands\']').html().length) {
			$('[data-content=\'brands\']')
					.append('<li class=\'select__variant\' data-id=\'null\' data-val=\'none\'>Нет совпадений</li>');
		}
	} else if ($(this).siblings('.select__variants').attr('data-content') === 'models') {

		$('[data-content=\'models\']').html('');

		var thisVal = $(this).val();

		carModels.forEach(function(element, index) {
			if (element.name.toLowerCase().indexOf($('[data-content=\'models\']').prev('input').val()) !== -1) {
				$('[data-content=\'models\']')
					.append('<li class=\'select__variant\' data-id=\''+
						element.id+
						'\' data-val=\''+
						element.name+
						'\'>'+
						element.name+
						'</li>');
			}
		});

		if (!$('[data-content=\'models\']').html().length) {
			$('[data-content=\'models\']')
					.append('<li class=\'select__variant\' data-id=\'null\' data-val=\'none\'>Нет совпадений</li>');
		}
	}
});
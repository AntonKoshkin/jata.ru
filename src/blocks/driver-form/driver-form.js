var BecomeDriverSerializer 	=	{
	first_name				: 'string',
	last_name				: 'string',
	email						: 'string',
	phone						: 'string',
	how_did_you_know		: 'unnecessary',
	car_year					: 'number',
	car_state				: 'string',
	car_brand				: 'string',
	car_model				: 'string',
	car_color				: 'string',
	avg_mileage_day		: 'number',
	avg_mileage_weekend	: 0,
	comment					: 'unnecessary',
};


function sendForm(page) {
	var linkTo = {
		root: 'https://jata.ru'
	};
	$.ajax({
		url: linkTo.root + '/api/v1/accounts/becomedriver',
		type: 'POST',
		data: BecomeDriverSerializer,
	})
	.done(function() {
		$('.message--success').addClass('message--show');

		// переключить страницу
		$('.driver-form').attr('data-page', '1');

		// очистка полей формы
		$('[data-field-type]')
			.each(function(index, el) {
				if ($(this).attr('data-field-type') === 'form_input') {
					$(this)
						.val('')
						.attr('data-filled', 'false')
						.attr('data-correct', 'null');
				} else if ($(this).attr('data-field-type') === 'form_select') {
					$(this)
						.val($(this).attr('data-placeholder'))
						.attr('data-correct', 'null')
						.attr('data-val', 'none');
					if ($(this).attr('data-id')) {
						$(this).attr('data-id', 'null');
					}
				}
			});

		// удаление марок
		$('[data-content=\'models\']')
			.html('<li class=\'select__variant\' data-val=\'no-items\'>Выберите марку авто</li>');

		// вывод количества полученных марок
		// console.log(BecomeDriverSerializer);
		console.log('form has beed sent');
	})
	.fail(function(data) {
		$('.message--fail').addClass('message--show');
		// console.log(BecomeDriverSerializer);
		if (data.responseText) {
			console.log('servers answer:\n',data.responseText);
		} else {
			console.log('UFO have interrupted our server\'s work\nwe\'l try to fix it');
		}
	});
}

$('body').on('click', '[data-way]', function(event) {
	event.preventDefault();
	
	var
		page							=	$(this).closest('.driver-form'),
		thisPage						=	page.attr('data-page'),
		currentPage					=	$('.driver-form__page[data-page=\''+ thisPage +'\']'),
		nextPage						=	+thisPage + 1,
		prevPage						=	+thisPage - 1;

	if ($(this).attr('data-way') === 'prev') {
		switch (prevPage) {
			case 1:
				page.attr('data-page', '1');
				break;
			case 2:
				page.attr('data-page', '2');
				break;
			default:
				break;
		}
	} else {
		var
			allCorrect	= false,
			dataPage		= $('.driver-form').attr('data-page');

		switch (dataPage) {
			// проверка полей на первой странице
			case '1':
				// на этой странице найти все поля и перебрать
				currentPage
					.find('[data-mask]')
					.each(function(index, el) {
						// если это поле невалидно (пусто)
						if (($(this).length) && ($(this).attr('data-correct') !== 'true')) {
							// найти все поля (снова) и перебрать
							currentPage
								.find('[data-mask]')
								.each(function(index, el) {
									// если это не отмечено как корректное
									if ($(this).attr('data-correct') !== 'true') {
										// отметить как ошибочное
										$(this).attr('data-correct', 'false');
									}
								});

							// все плохо
							allCorrect = false;
							// прервать перебор
							return false;
						// есди все норм
						} else {
							// записать данные в объект
							BecomeDriverSerializer[$(this).attr('id')] = $(this).val();

							// присвоить переменной тру
							allCorrect = true;
						}
					});

					// почистим номер телефона
					BecomeDriverSerializer.phone = BecomeDriverSerializer.phone.replace(/\D/g, '');

					// console.log(BecomeDriverSerializer.phone);
					
					// так как поле "как вы о нас узнали" не участвует в обходе, запишем его вручную
					BecomeDriverSerializer.how_did_you_know = $('#how_did_you_know').val();
				break;

			// проверка селектов на второй странице
			case '2':
				// на этой странице найти все инпуты и перебрать
				currentPage
					.find('.select__input')
					.each(function(index, el) {
						// если ничего не выбрано в поле
						if ($(this).attr('data-val') === 'none') {
							// найти снова все инпуты и перебрать
							currentPage
								.find('.select__input')
								.each(function(index, el) {
									if ($(this).attr('data-val') === 'none') {
										$(this).attr('data-correct', 'false');
									}
								});

							// все плохо
							allCorrect = false;
							// пошли все нафиг
							return false;
						// если все норм
						} else {
							// записать данные в объект
							if (($(this).attr('id') === 'car_brand') || ($(this).attr('id') === 'car_model')) {
								// тут выбор слать айди или строку
								BecomeDriverSerializer[$(this).attr('id')] = $(this).attr('data-id');
							} else {
								BecomeDriverSerializer[$(this).attr('id')] = $(this).attr('data-val');
							}
								
							// пока все норм
							allCorrect = true;
						}
					});
				break;

			// проверка полей на третьей странице
			case '3':
				// на этой странице найти все поля и перебрать
				currentPage
					.find('[data-mask]')
					.each(function(index, el) {
						// если это поле невалидно (пусто)
						if (($(this).length) && ($(this).attr('data-correct') !== 'true')) {
							// найти все поля (снова) и перебрать
							currentPage
								.find('[data-mask]')
								.each(function(index, el) {
									// если это не "как вы о нас узнали" и не отмечено как корректное
									if ($(this).attr('data-correct') !== 'true') {
										// отметить как ошибочное
										$(this).attr('data-correct', 'false');
									}
								});

							// все плохо
							allCorrect = false;
							// прервать перебор
							return false;
						// есди все норм
						} else {
							// найти все поля опять, обойти
							currentPage
								.find('[data-filled]')
								.each(function(index, el) {
									// записать данные в объект
									BecomeDriverSerializer[$(this).attr('id')] = $(this).val();
								});
							// присвоить переменной тру
							allCorrect = true;
						}
					});
				break;
			default:
				console.log('wrong page number');
				break;
		}

		// если все поля на странице правильно заполнены
		if (allCorrect === true) {
			switch (nextPage) {
				// на первой странице
				case 2:
					// переключить страницу
					page.attr('data-page', '2');
					// сбросить переменную
					allCorrect = false;
					break;
				// на второй странице
				case 3:
					// переключить страницу
					page.attr('data-page', '3');
					// сбросить переменную
					allCorrect = false;
					// перевести год в число
					BecomeDriverSerializer.car_year = +BecomeDriverSerializer.car_year;
					break;
				// на третьей странице
				case 4:
					
					// запустить функцию отправки формы
					sendForm($('.driver__form'));
					// сбросить переменную
					allCorrect = false;
					// перевести пробег в число
					BecomeDriverSerializer.avg_mileage_weekend = +BecomeDriverSerializer.avg_mileage_weekend;
					break;
				default:
					console.log('wrong next page number');
					break;
			}
		}
	}
});
'use strict';

import vars from '../../compile/vars';

const driverForm = {
	busy				: false,
	fieldsCorrect	: false,
	
	data: {
		first_name				: '',
		last_name				: '',
		email						: '',
		phone						: '',
		how_did_you_know		: '',
		car_year					: '',
		car_state				: '',
		car_brand				: '',
		car_model				: '',
		car_color				: '',
		avg_mileage_day		: '',
		avg_mileage_weekend	: '',
		comment					: '',
	},

	init() {
		$('body').on('click', '[data-way]', event => {
			event.preventDefault();

			const elem			= event.target;
			const page			= $('.driver-form');
			const dataPage		= Number(page.attr('data-page'));
			const currentPage	= $(`.driver-form__page[data-page=${dataPage}]`);
			const nextPage		= dataPage + 1;
			const prevPage		= dataPage - 1;

			if ($(elem).attr('data-way') === 'prev') {
				if (prevPage === 1 || prevPage === 2) {
					page.attr('data-page', prevPage);
				}
			} else {
				switch (dataPage) {
					case 1:
						driverForm.data.how_did_you_know = $('#how_did_you_know').val();

					case 2:
						currentPage
							.find('[data-mask]')
							.each((index, el) => {
								if ($(el).length && ($(el).attr('data-correct') !== 'true')) {
									currentPage
										.find('[data-mask]')
										.each((index, el) => {
											if ($(el).attr('data-correct') !== 'true') {
												$(el).attr('data-correct', 'false');
											}
										});

									driverForm.fieldsCorrect = false;
									return false;

								} else {
									driverForm.data[$(el).attr('id')] = $(el).val();

									driverForm.fieldsCorrect = true;
								}
							});

						driverForm.data.phone = driverForm.data.phone.replace(/\D/g, '');
						break;

					case 3:
						currentPage
							.find('[data-mask]')
							.each((index, el) => {
								if ($(el).length && $(el).attr('data-correct') !== 'true') {
									currentPage
									.find('[data-mask]')
									.each(function(index, el) {
										if ($(el).attr('data-correct') !== 'true') {
											$(el).attr('data-correct', 'false');
										}
									});

								driverForm.fieldsCorrect = false;

								return false;
								} else {
									currentPage
										.find('[data-filled]')
										.each((index, el) => {
											driverForm.data[$(el).attr('id')] = $(el).val();
										});

									driverForm.fieldsCorrect = true;
								}
							});
						break;

					default:
						console.log('wrong page number');
						break;
				}

				if (driverForm.fieldsCorrect) {
					switch (nextPage) {
						// на первой странице
						case 2:
							// переключить страницу
							page.attr('data-page', '2');
							// сбросить переменную
							driverForm.fieldsCorrect = false;
							break;

						// на второй странице
						case 3:
							// переключить страницу
							page.attr('data-page', '3');
							// сбросить переменную
							driverForm.fieldsCorrect = false;
							break;

						// на третьей странице
						case 4:
							// запустить функцию отправки формы
							driverForm.sendForm();
							// сбросить переменную
							driverForm.fieldsCorrect = false;
							break;

						default:
							console.log('wrong next page number');
							break;
					}
				}
			}
		});
	},

	sendForm() {
		if (!driverForm.busy) {
			console.log('start sending form');

			driverForm.busy = true;

			$.ajax({
				url	: vars.server + vars.api.becomeDriver,
				type	: 'POST',
				data	: driverForm.data,
			})
				.success(result => {
					$('.message--success').addClass('message--show');

					// переключить страницу
					$('.driver-form').attr('data-page', '1');

					// очистка полей формы
					$('[data-field-type]')
						.each(function(index, el) {
							$(el)
								.val('')
								.attr('data-filled', 'false')
								.attr('data-correct', 'null');
						});

					driverForm.busy = false;

					console.log('form has beed sent');
				})
				.fail(error => {
					$('.message--fail').addClass('message--show');
					if (error.responseText) {
						console.log('servers answer:\n',error.responseText);
					} else {
						console.log('UFO have interrupted our server\'s work\nwe\'l try to fix it');
					}
					driverForm.busy = false;
				});
		}
	},
};

module.exports = driverForm;
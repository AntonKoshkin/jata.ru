/* global $ */

const input = {
	/**
	 * инит функция
	 */
	init() {
		$('body').on('blur', '.input__input', event => {
			const elem = $(event.target).closest('.input__input');

			if (elem.val()) {
				elem.attr('data-filled', 'true');
			} else {
				elem.attr('data-filled', 'false');
			}
		});

		$('body').on('keyup', '[data-mask=\'tel\']', event => {
			const elem = $(event.target).closest('[data-mask=\'tel\']');

			elem.val(input.format(elem.val(), 'tel'));
		});

		$('body').on('click', '[data-mask=\'tel\']', event => {
			const elem = $(event.target).closest('[data-mask=\'tel\']');

			elem.val(input.format(elem.val(), 'tel'));
		});

		$('body').on('keyup', '[data-mask=\'year\']', event => {
			const elem = $(event.target).closest('[data-mask=\'year\']');

			elem.val(input.format(elem.val(), 'year'));
		});

		$('body').on('keyup', '[data-mask=\'number\']', event => {
			const elem = $(event.target).closest('[data-mask=\'number\']');

			elem.val(input.format(elem.val(), 'number'));
		});

		$('body').on('blur', '[data-mask]', event => {
			const elem = $(event.target).closest('[data-mask]');

			switch (elem.attr('data-mask')) {
				case 'email':
					if (/.+@.+\..+/i.test(elem.val())) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;

				case 'tel':
					if (elem.val().length === 18) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;

				case 'name':
					if (/^[a-zA-Zа-яёА-ЯЁ][a-zA-Zа-яёА-ЯЁ0-9-_.]{1,20}$/.test(elem.val())) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;

				case 'empty':
				case 'text':
				case 'number':
					if (elem.val()) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'empty');
					}
					break;

				case 'year':
					if (elem.val() &&
						parseInt(elem.val(), 10) >= 1900 &&
						parseInt(elem.val(), 10) <= new Date().getFullYear()) {
						elem.attr('data-correct', 'true');
					} else {
						elem.attr('data-correct', 'false');
					}
					break;

				// skip default
			}
		});

		$('body').on('input', '[data-mask]', event => {
			const elem = $(event.target).closest('[data-mask]');

			elem.attr('data-correct', 'null');
		});
	},
	/**
	 * форматирует значение в инпуте
	 * @param  {string} data   значение в инпуте
	 * @param  {string} format имя формата
	 * @return {string}        отформатированное значение
	 */
	format(data, format) {
		let newData = '';

		switch (format) {
			case 'number':
				newData = data.replace(/\D/g, '');
				break;

			case 'year':
				newData = input.format(data, 'number');

				if (newData.length > 4) {
					newData = newData.slice(0, 4);
				}
				break;

			case 'tel':
				newData = input.format(data, 'number');

				if (newData.length <= 11) {
					switch (newData.length) {
						case 0:
							newData = '+7 (';
							break;
						case 1:
							if (newData[0] !== '7') {
								newData = '+7 (' + newData[0];
							} else {
								newData = '+7 (';
							}
							break;
						case 2:
							newData = '+7 (' + newData[1];
							break;
						case 3:
							newData = '+7 (' + newData[1] + newData[2];
							break;
						case 4:
							newData = '+7 (' + newData[1] + newData[2] + newData[3];
							break;
						case 5:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] +
											') ' + newData[4];
							break;
						case 6:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] +
											') ' + newData[4] + newData[5];
							break;
						case 7:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] +
											') ' + newData[4] + newData[5] + newData[6];
							break;
						case 8:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] +
											') ' + newData[4] + newData[5] + newData[6] +
											'-' + newData[7];
							break;
						case 9:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] +
											') ' + newData[4] + newData[5] + newData[6] +
											'-' + newData[7] + newData[8];
							break;
						case 10:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] +
											') ' + newData[4] + newData[5] + newData[6] +
											'-' + newData[7] + newData[8] +
											'-' + newData[9];
							break;
						case 11:
							newData = '+7 (' + newData[1] + newData[2] + newData[3] +
											') ' + newData[4] + newData[5] + newData[6] +
											'-' + newData[7] + newData[8] +
											'-' + newData[9] + newData[10];
							break;

						// skip default
					}
				} else {
					newData = '+7 (' + newData[1] + newData[2] + newData[3] +
									') ' + newData[4] + newData[5] + newData[6] +
									'-' + newData[7] + newData[8] +
									'-' + newData[9] + newData[10];
				}
				break;

			default:
				newData = data;
				console.log('wrong input format');
				break;
		}

		return newData;
	},
};

module.exports = input;

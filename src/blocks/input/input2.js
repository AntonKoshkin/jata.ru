const input = {
	/**
	 * навешивает события на инпут
	 */
	init() {
		$('body').on('blur', '.input__input', event => {
			const elem = event.target;

			if ($(elem).val()) {
				$(elem).attr('data-filled', 'true');
			} else {
				$(elem).attr('data-filled', 'false');
			}
		});

		$('body').on('keyup', '[data-mask=\'tel\']', event => {
			const elem = event.target;

			$(elem).val(input.format($(elem).val(), 'tel'));
		});

		$('body').on('click', '[data-mask=\'tel\']', event => {
			const elem = event.target;

			$(elem).val(input.format($(elem).val(), 'tel'));
		});

		$('body').on('keyup', '[data-mask=\'year\']', event => {
			const elem = event.target;

			$(elem).val(input.format($(elem).val(), 'year'));
		});

		$('body').on('keyup', '[data-mask=\'number\']', event => {
			const elem = event.target;

			$(elem).val(input.format($(elem).val(), 'number'));
		});

		$('body').on('blur', '[data-mask]', event => {
			const elem = event.target;

			switch ($(elem).attr('data-mask')) {
				case 'email':
					if (/.+@.+\..+/i.test($(elem).val())) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'false');
					}
					break;

				case 'tel':
					// /^([\+]+)*[0-9\x20\x28\x29\-]{7,11}$/
					if ($(elem).val().length === 18) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'false');
					}
					break;

				case 'name':
					if (/^[a-zA-Zа-яёА-ЯЁ][a-zA-Zа-яёА-ЯЁ0-9-_\.]{1,20}$/.test($(elem).val())) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'false');
					}
					break;

				case 'empty':
				case 'text':
				case 'number':
					if ($(elem).val()) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'empty');
					}
					break;

				case 'year':
					if ($(elem).val() &&
						parseInt($(elem).val()) >= 1900 &&
						parseInt($(elem).val()) <= new Date().getFullYear()) {
						$(elem).attr('data-correct', 'true');
					} else {
						$(elem).attr('data-correct', 'false');
					}
					break;
			}
		});

		$('body').on('input', '[data-mask]', event => {
			const elem = event.target;

			$(elem).attr('data-correct', 'null');
		});
	},


	/**
	 * форматирует значение в инпуте
	 * @param  {string} data   значение в инпуте
	 * @param  {string} format имя формата
	 * @return {string}        отформатированное значение
	 */
	format(data, format) {
		switch (format) {
			case 'number':
				return data.replace(/\D/g, '');

			case 'year':
				data = input.format(data, 'number');

				if (data.length > 4) {
					data = data.slice(0, 4);
				}

				return data;

			case 'tel':
				data = input.format(data, 'number');

				let newData = '';

				if (data.length <= 11) {
					switch(data.length) {
						case 0:
							newData = '+7 (';
							break;
						case 1:
							if(data[0] !== '7') {
								newData = '+7 (' + data[0];
							} else {
								newData = '+7 (';
							}
							break;
						case 2:
							newData = '+7 (' + data[1];
							break;
						case 3:
							newData = '+7 (' + data[1] + data[2];
							break;
						case 4:
							newData = '+7 (' + data[1] + data[2] + data[3];
							break;
						case 5:
							newData = '+7 (' + data[1] + data[2] + data[3] +
											') ' + data[4];
							break;
						case 6:
							newData = '+7 (' + data[1] + data[2] + data[3] +
											') ' + data[4] + data[5];
							break;
						case 7:
							newData = '+7 (' + data[1] + data[2] + data[3] +
											') ' + data[4] + data[5] + data[6];
							break;
						case 8:
							newData = '+7 (' + data[1] + data[2] + data[3] +
											') ' + data[4] + data[5] + data[6] +
											'-' + data[7];
							break;
						case 9:
							newData = '+7 (' + data[1] + data[2] + data[3] +
											') ' + data[4] + data[5] + data[6] +
											'-' + data[7] + data[8];
							break;
						case 10:
							newData = '+7 (' + data[1] + data[2] + data[3] +
											') ' + data[4] + data[5] + data[6] +
											'-' + data[7] + data[8] +
											'-' + data[9];
							break;
						case 11:
							newData = '+7 (' + data[1] + data[2] + data[3] +
											') ' + data[4] + data[5] + data[6] +
											'-' + data[7] + data[8] +
											'-' + data[9] + data[10];
							break;
					}
				} else {
					newData = '+7 (' + data[1] + data[2] + data[3] +
									') ' + data[4] + data[5] + data[6] +
									'-' + data[7] + data[8] +
									'-' + data[9] + data[10];
				}
				return newData;

			default:
				console.log('wrong input format');
				break;
		}
	},
};

module.exports = input;
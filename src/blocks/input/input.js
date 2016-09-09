function numberFormat(num) {
	num = num.replace(/\D/g, '');
	return num; 
}

function telFormat(num) {
	num = num.replace(/\D/g, '');

	var tel;

	if(num.length <= 11) {
		switch(num.length) {
			case 0:
				tel = '+7 (';
				break;
			case 1:
				if(num[0] != 7) {
					tel = '+7 (' + num[0];
				} else {
					tel = '+7 (';
				}
				break;
			case 2:
				tel = '+7 (' + num[1];
				break;
			case 3:
				tel = '+7 (' + num[1] + num[2];
				break;
			case 4:
				tel = '+7 (' + num[1] + num[2] + num[3];
				break;
			case 5:
				tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4];
				break;
			case 6:
				tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5];
				break;
			case 7:
				tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6];
				break;
			case 8:
				tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7];
				break;
			case 9:
				tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7] + num[8];
				break;
			case 10:
				tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7] + num[8] + '-' + num[9];
				break;
			case 11:
				tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7] + num[8] + '-' + num[9] + num[10];
				break;
		}
	} else {
		tel = '+7 (' + num[1] + num[2] + num[3] + ') ' + num[4] + num[5] + num[6] + '-' + num[7] + num[8] + '-' + num[9] + num[10];
	}

	return tel;
}

$('body').on('blur', '.input__input', function(event) {
	if ($(this).val() !== '') {
		$(this).attr('data-filled', 'true');
	} else {
		$(this).attr('data-filled', 'false');
	}

	// console.log(/.+@.+\..+/i.test($(this).val()))
});

// /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/

$('body').on('keyup', '[data-mask=\'tel\']', function() {
	$(this).val(telFormat($(this).val()));
});

$('body').on('click', '[data-mask=\'tel\']', function() {
	$(this).val(telFormat($(this).val()));
});

$('body').on('keyup', '[data-mask=\'number\']', function() {
	$(this).val(numberFormat($(this).val()));
});

$('body').on('blur', '[data-mask]', function(event) {
	switch ($(this).attr('data-mask')) {
		case 'email':
			if (/.+@.+\..+/i.test($(this).val())) {
				$(this).attr('data-correct', 'true');
			} else {
				$(this).attr('data-correct', 'false');
			}
			break;

		case 'tel':
			// /^([\+]+)*[0-9\x20\x28\x29\-]{7,11}$/
			if ($(this).val().length === 18) {
				$(this).attr('data-correct', 'true');
			} else {
				$(this).attr('data-correct', 'false');
			}
			break;

		case 'name':
			if (/^[a-zA-Zа-яёА-ЯЁ][a-zA-Zа-яёА-ЯЁ0-9-_\.]{1,20}$/.test($(this).val())) {
				$(this).attr('data-correct', 'true');
			} else {
				$(this).attr('data-correct', 'false');
			}
			break;

		case 'empty':
			if ($(this).val() !== '') {
				$(this).attr('data-correct', 'true');
			} else {
				$(this).attr('data-correct', 'empty');
			}
			break;

		case 'number':
			if ($(this).val() !== '') {
				$(this).attr('data-correct', 'true');
			} else {
				$(this).attr('data-correct', 'empty');
			}
			break;
	}
});

$('body').on('input', '[data-mask]', function(event) {
	$(this).attr('data-correct', 'null');
});
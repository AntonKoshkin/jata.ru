$('.variants')
	.hide();

jQuery(document).ready(function($) {
	// open/close by changing text in input/select
	$('body').on('input', '.input__input', function(event) {
		if ($(this).val() !== '') {
			$(this)
				.siblings('.variants')
				.show();
		} else {
			$(this)
				.siblings('.variants')
				.hide();
		}
	});

	$('body').on('click', '.custom-select__input', function(event) {
		event.preventDefault();

		$(this)
			.next('.variants')
			.toggle();
	});

	// click on variant
	$('body').on('click', '.variants__item', function(event) {
		event.preventDefault();

		$(this)
			.closest('.variants')
			.hide()
			.siblings('input')
			.val($(this).text());
	});

	// close when ESC pressed
	$('.input, .select').keyup(function(event) {
		if ((event.keyCode === 27) && ($(this).find('.variants').length)) {
			$(this)
			.find('.variants')
			.hide();
		}
	});

	// close on focusOut FUCKES UP CLICK ON VARIANTS!!!
	// $('.input, .select').focusout(function(event) {
	// 	if ($(this).find('.variants').length) {
	// 		$(this)
	// 			.find('.variants')
	// 			.hide();
	// 	}
	// });

	// close when click on eraser
	$('body').on('click', '.eraser', function(event) {
		event.preventDefault();

		$(this)
			.siblings('.variants')
			.hide();
	});
});
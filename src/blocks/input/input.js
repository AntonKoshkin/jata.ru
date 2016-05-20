// hiding eraser
$('.input__eraser')
	.hide();

// hidding errors
// $('.pop-error, .text-error')
// 	.hide();

// on typing in input
$('body').on('input', '.input__input', function(event) {
	
	// showing or hiding erase btn if text in input
	if ($(this).val() !== '') {
		$(this)
			.next('.input__eraser')
			.show();
	} else {
		$(this)
			.next('.input__eraser')
			.hide();
	}

	// PREVIEW
	// showing errors if has
	if ($(this).val() === 'error') {
		$(this)
			.closest('.input')
			.find('.pop-error')
			.show();
	}
});

// clearing input by clicking on btn
$('body').on('click', '.input__eraser', function(event) {
	event.preventDefault();

	$(this)
		.prev('.input__input')
		.val('');

	$(this)
		.hide();
});
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
	event.preventDefault();
	$(this)
		.closest('.select__variants')
		.siblings('.select__input')
		.val($(this).text())
		.closest('.select')
		.removeClass('select--open');
});
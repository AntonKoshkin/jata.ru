$('body').on('input', '.input__input', function(event) {
	if ($(this).val() !== '') {
		$(this).attr('data-filled', 'true');
	} else {
		$(this).attr('data-filled', 'false');
	}
});
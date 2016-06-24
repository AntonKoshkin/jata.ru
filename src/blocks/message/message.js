$('body').on('click', '.message__bg, .message__close', function(event) {
	event.preventDefault();
	
	$(this)
		.closest('.message')
		.removeClass('message--show');
});
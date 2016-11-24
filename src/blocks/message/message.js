const message = {
	init() {
		$('body').on('click', '.message__bg, .message__close', event => {
			event.preventDefault();
			
			$(elem)
				.closest('.message')
				.removeClass('message--show');
		});
	}
};

module.exports = message;
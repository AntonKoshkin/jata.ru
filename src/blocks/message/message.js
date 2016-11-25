const message = {
	/**
	 * инит функция
	 */
	init() {
		$('body').on('click', '.message__bg, .message__close', event => {
			event.preventDefault();
			
			$(event.target)
				.closest('.message')
				.removeClass('message--show');
		});
	}
};

module.exports = message;
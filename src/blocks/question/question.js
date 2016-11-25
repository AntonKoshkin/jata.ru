const question = {
	/**
	 * инит функция
	 */
	init() {
		$('.questions__item').eq(1).hide();

		$('body').on('click', '.main-btn--hdiw', event => {
			let elem = $(event.target).closest('.main-btn--hdiw');
			event.preventDefault();
			
			if (!elem.hasClass('main-btn--active')) {
				elem
					.addClass('main-btn--active')
					.siblings()
					.removeClass('main-btn--active');
			
				$('.questions__item')
					.eq(elem.index() - 2)
					.fadeIn(300)
					.siblings()
					.fadeOut(300);

				$('.questions__item')
					.find('.question__body')
					.slideUp(300);
			}
		});

		$('body').on('click', '.question__header', event => {
			let elem = $(event.target).closest('.question__header');
			event.preventDefault();
			
			elem
				.siblings('.question__body')
				.slideToggle(300)
				.closest('.question')
				.siblings('.question')
				.find('.question__body')
				.slideUp(300);
		});
	},
};

module.exports = question;
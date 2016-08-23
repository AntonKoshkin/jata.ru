$('.questions__item').eq(1).hide();

$('body').on('click', '.main-btn--hdiw', function(event) {
	event.preventDefault();
	
	if (!$(this).hasClass('main-btn--active')) {
		$(this)
			.addClass('main-btn--active')
			.siblings()
			.removeClass('main-btn--active');
	
		$('.questions__item')
			.eq($(this).index() - 2)
			.fadeIn(300)
			.siblings()
			.fadeOut(300);

		$('.questions__item')
			.find('.question__body')
			.slideUp(300);
	}
});

$('body').on('click', '.question__header', function(event) {
	event.preventDefault();
	
	$(this)
		// .closest('.question__header')
		.siblings('.question__body')
		.slideToggle(300)
		.closest('.question')
		.siblings('.question')
		.find('.question__body')
		.slideUp(300);
});
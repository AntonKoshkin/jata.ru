function scrollBtn() {
	if ($(window).scrollTop() >= 800) {
		$('.up-btn').addClass('up-btn--show');
	} else {
		$('.up-btn').removeClass('up-btn--show');
	}
}

if ($('.up-btn').length) {
	$(document).ready(function() {
		scrollBtn();
	});

	$(window).scroll(function() {
		scrollBtn();
	});

	$('body').on('click', '.up-btn', function(event) {
		$('html, body')
			.stop()
			.animate({
				scrollTop: 0
			}, $(window).scrollTop()/4);
	});
}
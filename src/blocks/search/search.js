var searchAnimationStarted = 0;

$(window).scroll(function(event) {
	if (($('.search').length) && ($(window).scrollTop() >= $('.search').offset().top - $(window).height() + $('.search').height() / 2) && (searchAnimationStarted !== 1)) {
		$('.search').addClass('search--animate');
		searchAnimationStarted = 1;
	}
});
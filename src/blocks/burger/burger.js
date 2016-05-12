jQuery(document).ready(function($) {
	$('body').on('click', '.burger', function(event) {
		event.preventDefault();

		$('.navigation').toggleClass('navigation--open');

		if ($('.navigation').hasClass('navigation--open')) {
			$('html').removeClass('no-scroll');
		} else {
			$('html').addClass('no-scroll');
		}
	});
});
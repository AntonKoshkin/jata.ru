$('body').on('click', '.scroll-btn', function(event) {
	event.preventDefault();
	
	$('html, body')
		.animate({
			scrollTop: $(this).closest('.section').outerHeight()
		}, 700);
});
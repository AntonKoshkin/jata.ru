$('body').on('click', '.burger', function(event) {
	event.preventDefault();
	$('.navigation').toggleClass('navigation--open');
});
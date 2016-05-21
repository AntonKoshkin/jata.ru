$('body').on('click', '[data-link]', function(event) {
	event.preventDefault();
	location.href = $(this).attr('data-link');
});
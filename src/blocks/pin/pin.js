$('body').on('mouseenter', '.pin', function(event) {
	event.preventDefault();
	
	$(this)
		.removeClass('pin--show')
		.css('z-index', '2')
		.siblings()
		.removeClass('pin--show')
		.css('z-index', '1');
});

var sec	= 55555;

function countdown() {
	$('[data-clock=\'h\']').text(Math.floor(sec/3600));
	$('[data-clock=\'m\']').text(Math.floor(sec%3600/60));
	$('[data-clock=\'s\']').text(Math.floor(sec%3600%60));

	sec += 1;
}

if ($('html').hasClass('desktop')) {
	var newDate = new Date();

	newDate.setDate(newDate.getDate());

	var	hours = new Date().getHours(),
			minutes = new Date().getMinutes(),
			seconds = new Date().getSeconds();

	$('[data-clock=\'h\'').text(hours);
	$('[data-clock=\'m\'').text(minutes);
	$('[data-clock=\'s\'').text(seconds);

	setInterval(function() {
		hours = new Date().getHours();
		$('[data-clock=\'h\'').text(hours);

		minutes = new Date().getMinutes();
		$('[data-clock=\'m\'').text(minutes);

		seconds = new Date().getSeconds();
		$('[data-clock=\'s\'').text(seconds);
	}, 1000);
} else {
	$('[data-clock=\'h\']').text(Math.floor(sec/3600));
	$('[data-clock=\'m\']').text(Math.floor(sec%3600/60));
	$('[data-clock=\'s\']').text(Math.floor(sec%3600%60));

	sec += 1;

	setInterval(countdown, 1000);
}
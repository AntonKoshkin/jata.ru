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

function twoNumbers(number) {
	if (number < 10) {
		number = '0' + number.toString();
	}
	return number;
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
		
		$('[data-clock=\'h\'').text(twoNumbers(hours));

		minutes = new Date().getMinutes();
		
		$('[data-clock=\'m\'').text(twoNumbers(minutes));

		seconds = new Date().getSeconds();
		
		$('[data-clock=\'s\'').text(twoNumbers(seconds));
	}, 1000);
} else {
	$('[data-clock=\'h\']').text(Math.floor(sec/3600) < 10 ? '0' + Math.floor(sec/3600) : Math.floor(sec/3600));
	$('[data-clock=\'m\']').text(Math.floor(sec%3600/60) < 10 ? '0' + Math.floor(sec%3600/60) : Math.floor(sec%3600/60));
	$('[data-clock=\'s\']').text(Math.floor(sec%3600%60) < 10 ? '0' + Math.floor(sec%3600%60) : Math.floor(sec%3600%60));

	sec += 1;

	setInterval(countdown, 1000);
}
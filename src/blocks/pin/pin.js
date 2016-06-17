$('body').on('mouseenter', '.map .pin', function(event) {
	event.preventDefault();
	
	$(this)
		.removeClass('pin--show')
		.css('z-index', '2')
		.siblings()
		.removeClass('pin--show')
		.css('z-index', '1');
});

// создаем новый объект для хранения даты
var newDate = new Date();

// извлекаем текущую дату в новый объект
newDate.setDate(newDate.getDate());

var	hours = new Date().getHours(),
		minutes = new Date().getMinutes(),
		seconds = new Date().getSeconds();

$('[data-clock=\'h\'').text(( hours < 10 ? '0' : '' ) + hours);
$('[data-clock=\'m\'').text(( minutes < 10 ? '0' : '' ) + minutes);
$('[data-clock=\'s\'').text(( seconds < 10 ? '0' : '' ) + seconds);

setInterval(function() {
	hours = new Date().getHours();
	$('[data-clock=\'h\'').text(( hours < 10 ? '0' : '' ) + hours);
}, 1000);

setInterval(function() {
	minutes = new Date().getMinutes();
	$('[data-clock=\'m\'').text(( minutes < 10 ? '0' : '' ) + minutes);
}, 1000);

setInterval(function() {
	seconds = new Date().getSeconds();
	$('[data-clock=\'s\'').text(( seconds < 10 ? '0' : '' ) + seconds);
}, 1000);
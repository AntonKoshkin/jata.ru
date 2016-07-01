var
	today	= new Date(),
	year	= today.getFullYear(),
	thisYear;

// генерация списка годов
for (var i = 0; i <= 21; i++) {
	thisYear = +year - i;
	$('[data-content=\'years\']')
		.append('<li class=\'select__variant\' data-val=\''+thisYear+'\'>'+thisYear+'</li>');
}

$.ajax({
	url: 'http://jata.ru:80/api/v1/vehicles/brands/',
	type: 'GET',
	dataType: 'json',
})
.done(function(data) {
	console.log('got ' + data.length + ' car brands');

	data.forEach(function(element, index) {
		$('[data-content=\'brands\']')
			.append('<li class=\'select__variant\' data-id=\''+element.id+'\' data-val=\''+element.name+'\'>'+element.name+'</li>');
	});
})
.fail(function() {
	console.log('error on getting car brands');
});
var
	carBrands	= {},
	carModels	= {},
	today	= new Date(),
	thisYear,
	year	= today.getFullYear();

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
			.append('<li class=\'select__variant\' data-id=\''+
				element.id+
				'\' data-val=\''+
				element.name+
				'\'>'+
				element.name+
				'</li>');
	});

	carBrands = data;

	return carBrands;
})
.fail(function() {
	console.log('error on getting car brands');
});
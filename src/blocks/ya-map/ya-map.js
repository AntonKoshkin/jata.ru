if ($('#yaMap').length) {
	ymaps.ready(init);
	var
		map,
		point;
}

function init(){ 
	map = new ymaps.Map('yaMap', {
		center	: [
			59.91596187,
			30.30575744
		],
		zoom		: 14,
		controls	: [
			'zoomControl',
		],
	});

	var
		redIcon	=	ymaps
							.templateLayoutFactory
							.createClass('<div class=\'ya-map__icon ya-map__icon--red\'></div>'),
		blueIcon	=	ymaps
							.templateLayoutFactory
							.createClass('<div class=\'ya-map__icon ya-map__icon--blue\'></div>');

	pointOne = new ymaps.Placemark(
		[
			59.92191840,
			30.31779727
		], {
			hintContent			: 'Точка для обклейки',
			balloonContent		: 'Спб, Московский проспект, 97а<br>10:00-18:00',
		}, {
			iconLayout			: blueIcon,
			iconShape			: {
				type			: 'Rectangle',
				coordinates	: [
					[
						-7,
						-40
					], [
						33,
						0
					]
				]
			}
		}
	);

	pointTwo = new ymaps.Placemark(
		[
			59.90988461,
			30.29648772
		], {
			hintContent			: 'Главный офис',
			balloonContent		: 'Какой-то другой адрес<br>10:00-18:00',
		}, {
			iconLayout			: redIcon,
			iconShape			: {
				type			: 'Rectangle',
				coordinates	: [
					[
						-7,
						-40
					], [
						33,
						0
					]
				]
			}
		}
	);

	map.behaviors.disable('scrollZoom');

	map.geoObjects.add(pointOne);
	map.geoObjects.add(pointTwo);
}
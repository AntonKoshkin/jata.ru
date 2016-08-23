if ($('#yaMap').length) {
	ymaps.ready(init);
	var
		map,
		point;
}

function init(){ 
	map = new ymaps.Map('yaMap', {
		center	: [
			59.93159322233984,
			30.375144682556122
		],
		zoom		: 13,
		controls	: [
			'zoomControl',
		],
	});

	var
		redIcon	=	ymaps.templateLayoutFactory
							.createClass('<div class=\'ya-map__icon ya-map__icon--red\'></div>'),
		blueIcon	=	ymaps.templateLayoutFactory
							.createClass('<div class=\'ya-map__icon ya-map__icon--blue\'></div>');

	pointOne = new ymaps.Placemark(
		[
			59.92022975962769,
			30.372955999999977
		], {
			hintContent			: 'Точка для оклейки',
			balloonContent		: 'СПб, Кременчугская ул., д.8',
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
			59.94484093771931,
			30.38859016684016
		], {
			hintContent			: 'Главный офис',
			balloonContent		: 'СПб, Суворовский проспект, 65б, офис 16',
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
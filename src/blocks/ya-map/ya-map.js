/* global $, ymaps */

const yaMap = {
	points: [],
	map   : {},
	/**
	 * объявляет точки (надо выполнять после создания карты)
	 */
	setPoints() {
		this.points = [
			{
				coords: [59.92022975962769, 30.372955999999977],
				titles: {
					hintContent   : 'Бокс для оклейки',
					balloonContent: 'СПб, Кременчугская ул., д.8',
				},
				params: {
					iconLayout: ymaps.templateLayoutFactory
						.createClass('<div class=\'ya-map__icon ya-map__icon--blue\'></div>'),

					iconShape: {
						type       : 'Rectangle',
						coordinates: [[-7, -40], [33, 0]],
					},
				},
			},
			{
				coords: [59.94484093771931, 30.38859016684016],
				titles: {
					hintContent   : 'Главный офис',
					balloonContent: 'СПб, Суворовский проспект, 65б, офис 16',
				},
				params: {
					iconLayout: ymaps.templateLayoutFactory
						.createClass('<div class=\'ya-map__icon ya-map__icon--red\'></div>'),

					iconShape: {
						type       : 'Rectangle',
						coordinates: [[-7, -40], [33, 0]],
					},
				},
			}
		];
	},
	/**
	 * создает точку на карте
	 * @param {objext} point объект с данными точки
	 */
	setPoint(point) {
		this.map.geoObjects.add(new ymaps.Placemark(point.coords, point.titles, point.params));
	},
	/**
	 * создает карту
	 */
	setMap() {
		ymaps.ready(() => {
			this.map = new ymaps.Map('yaMap', {
				center: [
					59.93159322233984,
					30.375144682556122
				],
				controls: [
					'zoomControl'
				],
				zoom: 13,
			});

			this.setPoints();

			this.points.forEach(elem => {
				this.setPoint(elem);
			});

			this.map.behaviors.disable('scrollZoom');
		});
	},
	/**
	 * инит функция
	 */
	init() {
		this.setMap();
	},
};

module.exports = yaMap;

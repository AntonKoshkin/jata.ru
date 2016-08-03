var
	container	= $('.gallery'),
	iteration	= 0,
	imgCounter	= 1,
	firstLoad	= true,
	loader		= $('.gallery__loading'),
	hasPhotos	= true,
	loadingNow	= false,
	more			= $('.gallery__btn');

loader.hide();
more.hide();

// ajax getting items
function ajaxGettingItems(firstImg, lastImg, items, imgCounter, numOfItems, firstLoad, callback) {
	console.log('ajaxGettingItems start');

	for (var i = firstImg; i <= lastImg; i++) {
		$.ajax({
			url: '/img/gallery/'+ i +'.jpg',
			type: 'GET',
		})
		.done(function(data) {
			// запишем картинку
			item = '<div data-url=\'/img/gallery/'+
				(items.length+firstImg) + '.jpg\' class=\'gallery__item\'><img src=\'/img/gallery/'+
				(items.length+firstImg) + '.jpg\' alt><div class=\'gallery__darkness\'></div></div>';
			
			// добавим в массив
			items.push(item);

			imgCounter++;

			// на последней итерации
			if (items.length === numOfItems) {
				items = $(items.join(''));
				callback(items);
			}
		})
		.fail(function() {
			// добавим пустоту в массив
			items.push('');

			// на последней итерации
			if (items.length === numOfItems) {
				items = $(items.join(''));
				callback(items);

				hasPhotos = false;
				more.hide();
				// отключение подгрузки
				console.log('no more photos');
			}
		});
	}
}

// функция пихания в дом
function pushItems(items, container, firstLoad, callback) {
	console.log('pushItems start');

	if (firstLoad) {
		container
			.masonry({
				// animationOptions	: {
				// 	queue		: false,
				// 	duration	: 300,
				// },
				columnWidth			: '.gallery__item',
				// fitWidth				: true,
				// gutter				: 5,
				isAnimated			: true,
				isInitLayout		: true,
				isResizable			: true,
				itemSelector		: '.gallery__item',
				percentPosition	: true,
				// resize				: false,
				singleMode			: true,
			});

		container
			.append($(items));

		$(items).hide();

		$(items)
			.imagesLoaded()
			.progress(function(imgLoad, image) {
				var $item = $(image.img).parents('.gallery__item');

				$item.show();

				container
					.masonry('appended', $item)
					.masonry();
			});

		container

		firstLoad = false;

		loader.removeClass('gallery__loading--first');
	} else {
		container.masonry('appended', $(items));
	}

	callback();
}

function loadItems(iteration, imgCounter, container, firstLoad, callback) {
	console.log('loadItems start');

	loader.show();
	more.hide();

	var
		numOfItems = 10,
		items = [],
		item;

	if (iteration === 0) {
		numOfItems = 30;
	} else {
		numOfItems = 10;
	}

	var
		firstImg	= iteration === 0 ? 1	: iteration*10 + 21,
		lastImg	= iteration === 0 ? 30	: iteration*10 + 30;

	ajaxGettingItems(firstImg, lastImg, items, imgCounter, numOfItems, firstLoad, function(items) {
		console.log('ajaxGettingItems end');
		
		pushItems(items, container, firstLoad, function() {
			loader.hide();
			more.show();
			console.log('pushItems end');
		});
	});

	window.iteration++;

	callback(iteration);
}

$(document).ready(function() {
	loadItems(iteration, imgCounter, container, firstLoad, function(iteration) {
		console.log('loadItems end');
	});

	$('body').on('click', '.gallery__btn', function(event) {
		loadItems(iteration, imgCounter, container, firstLoad, function(iteration) {
			console.log('loadItems end');
		});
	});

	$('body').on('click', '.gallery__item', function(event) {
		$('.gallery__modal')
			.html('<img src=\'' +
				$(this).attr('data-url') +
				'\' alt=\'\'>')
			.closest('.gallery__bg')
			.show();
	});

	$('body').on('click', '.gallery__bg', function(event) {
		$(this).hide();
	});
});
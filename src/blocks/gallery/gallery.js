// ajax getting items
function ajaxGettingItems(firstImg, lastImg, items, imgCounter, numOfItems, callback) {
	console.log('ajaxGettingItems start');
	for (var i = firstImg; i <= lastImg; i++) {
		console.log(i);

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
				// // вызов функции пихания в дом
				// pushItems(items, $grid, function() {
				// 	$grid.masonry('layout');
				// });
				// // console.log(items)
				// console.log('ajax end');
				callback(items);
				
			}
		})
		.fail(function() {
			// добавим пустоту в массив
			items.push('');
			// на последней итерации
			// if (items.length === numOfItems) {
			// 	// вызов функции пихания в дом
			// 	pushItems(items);
			// 	console.log('no more photos');
			// 	$('body').off('click', '.gallery__item');
			// }
		});
	}

}




// функция пихания в дом
function pushItems(items, $grid, callback) {
	console.log('pushItems start');
	var $items = $(items.join(''));
	console.log($items);

	// container.masonry();
	// container
	// 	.append($items)
	// 	.masonry('appended', $items);
	// // just do layout on imagesLoaded
	// container.imagesLoaded(function() {
	// 	container.masonry('layout');
	// 	$items.show();
	// });

	$grid
		.append($items)
		.masonry('addItems', $items);

	// $items
	// 	.hide()
	// 	.imagesLoaded()
	// 	.progress(function(instance, image) {
	// 		$grid;

	// 		var $item = $(image.img).parent('.gallery__item');
	// 		container
	// 			.masonry('appended', $item)
	// 			.masonry();

	// 		var result = image.isLoaded ? 'loaded' : 'broken';
	// 		console.log( 'image is ' + result + ' for ' + image.img.src );
	// 	})
	// 	.done(function(instance) {
	// 		$items.show();
	// 	})
	// 	.fail(function(instance) {
	// 		console.log(instance);
	// 		$('img').error(function() {
	// 			$(this)
	// 				// .closest('.gallery__item')
	// 				.attr('img-error', 'true');
	// 			container.masonry('remove', $('[img-error=\'true\']'));
	// 		});
	// 	})
	
	callback();
	console.log('pushitems end');
}

// функция получения элементов
function getItems(iteration, imgCounter, $grid, callback) {
	console.log('getItems start');

	var
		numOfItems,
		items = [],
		item;

	// для первого прохода 30 элементов
	// для остальных - 10
	if (iteration === 0) {
		numOfItems = 30;
	} else {
		numOfItems = 10;
	}

	var
		firstImg	= iteration === 0 ? 1	: iteration*10 + 21,
		lastImg	= iteration === 0 ? 30	: iteration*10 + 30;

	// console.log('ajax start');
	// пробежимся аяксом по картинкам
	// for (var i = firstImg; i <= lastImg; i++) {
	// 	console.log(i);

		// $.ajax({
		// 	url: '/img/gallery/'+ i +'.jpg',
		// 	type: 'GET',
		// })
		// .done(function(data) {
		// 	// запишем картинку
		// 	item = '<div data-url=\'/img/gallery/'+
		// 		(items.length+firstImg) + '.jpg\' class=\'gallery__item\'><img src=\'/img/gallery/'+
		// 		(items.length+firstImg) + '.jpg\' alt><div class=\'gallery__darkness\'></div></div>';
			
		// 	// добавим в массив
		// 	items.push(item);

		// 	imgCounter++;

		// 	// на последней итерации
		// 	if (items.length === numOfItems) {
		// 		// вызов функции пихания в дом
		// 		pushItems(items, $grid, function() {
		// 			$grid.masonry('layout');
		// 		});
		// 		// console.log(items)
		// 		console.log('ajax end');
		// 	}
		// })
		// .fail(function() {
		// 	// добавим пустоту в массив
		// 	items.push('');
		// 	// на последней итерации
		// 	if (items.length === numOfItems) {
		// 		// вызов функции пихания в дом
		// 		pushItems(items);
		// 		console.log('no more photos');
		// 		$('body').off('click', '.gallery__item');
		// 	}
		// });
	// }
	ajaxGettingItems(firstImg, lastImg, items, imgCounter, numOfItems, function(items) {
		pushItems(items, $grid, function() {
			$grid.masonry('prepended', $(items));
		});
		// console.log('ajaxGettingItems end')
	})

	// увеличим счетчик подгрузок
	iteration++;
	console.log('getitems end');

}

$(document).ready(function() {
	var
		container	= $('.gallery'),
		iteration	= 0,
		imgCounter	= 1;

	var $grid = $('.gallery')
		.masonry({
			// animationOptions	: {
			// 	queue		: false,
			// 	duration	: 300,
			// },
			columnWidth			: '.gallery__item',
			fitWidth				: true,
			// gutter				: 5,
			isAnimated			: true,
			isInitLayout		: true,
			isResizable			: true,
			itemSelector		: '.gallery__item',
			percentPosition	: true,
			resize				: false,
			singleMode			: true,
		});

	getItems(iteration, imgCounter, $grid);

	$('body').on('click', '.gallery__item', function(event) {
		getItems(iteration, imgCounter, $grid);
	});
});
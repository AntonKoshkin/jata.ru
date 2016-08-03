var gallery = {

	// ПЕРЕМЕННЫЕ
	// контейнер
	container		: $('.gallery'),

	// список всех имеющихся картинок
	allItems			: [],

	// картинки для добавления в ДОМ
	itemsToPush		: [],

	// загружаются ли сейчас фотки
	isLoading		: false,

	// лоадер
	loader			: $('.gallery__loading'),

	// кнопка подгрузки
	moreBtn			: $('.gallery__btn'),

	// должна ли галерея продолжать подгружать фотки
	isWorking		: true,

	// ФУНКЦИИ
	// начало загрузки фоток
	loadingStart	: function() {
		if (gallery.isWorking) {
			gallery.isLoading = true;

			gallery.loader
				.removeClass('gallery__loading--first')
				.show();
		}

		gallery.moreBtn.hide();
	},
	
	// конец загрузки фоток
	loadingEnd		: function(callback) {
		if (gallery.isWorking) {
			gallery.isLoading = false;

			gallery.loader.hide();
			// gallery.moreBtn.show();

			callback();
		}
	},

	// картинок больше нет, прекращение загрузок
	fullStop			: function() {
		gallery.isWorking = false;

		gallery.loader.hide();
		// gallery.moreBtn.hide();
	},

	// получение списка картинок
	getItems			: function(callback) {
		gallery.loadingStart();

		jQuery(document).ready(function($) {
			$.ajax({
				url: 'http://jata.ru:80/api/v1/gallery',
				type: 'POST',
				data: {tags: 'main'},
			})
			.done(function(data) {
				// console.log('список картинок получен. длина - '+data.length+' штук');

				gallery.allItems = data.reverse();

				callback();
			})
			.fail(function(data) {
				console.log('список картинок не получен :(');
			});
		});
	},

	// первая загрузка фоток
	firstPushing	: function(callback) {
		if (gallery.allItems.length >= 30) {
			gallery.itemsToPush	=	gallery.allItems.splice(gallery.allItems.length - 31, 30);
		} else {
			gallery.itemsToPush = gallery.allItems;
		}

		for(var i = 0, length1 = gallery.itemsToPush.length; i < length1; i++){
			gallery.itemsToPush[i] = '<div data-url=\'http://jata.ru'+
				(gallery.itemsToPush[i]) + '\' class=\'gallery__item\'><img src=\'http://jata.ru'+
				(gallery.itemsToPush[i]) + '\' alt><div class=\'gallery__darkness\'></div></div>';
		}

		if (gallery.isWorking) {
			gallery.itemsToPush = $(gallery.itemsToPush.join(''));

			gallery.container
				.masonry({
					columnWidth			: '.gallery__item',
					isAnimated			: true,
					isInitLayout		: true,
					isResizable			: true,
					itemSelector		: '.gallery__item',
					percentPosition	: true,
					singleMode			: true,
				})
				.append(gallery.itemsToPush);

			gallery.itemsToPush
				.hide()
				.imagesLoaded()
				.progress(function(imgLoad, image) {
					var $item = $(image.img).parents('.gallery__item');

					$item.show();

					gallery.container
						.masonry('appended', $item)
						.masonry();
				})
				.done(function() { 
					callback();
				});

			gallery.itemsToPush = [];
		}
	},

	// любая последующая загрузка фоток
	otherPushing		: function(callback) {
		if (gallery.allItems.length >= 10) {
			gallery.itemsToPush	=	gallery.allItems.splice(gallery.allItems.length - 11, 10);
		} else {
			gallery.itemsToPush = gallery.allItems;
			gallery.allItems = [];
		}

		for(var i = 0, length1 = gallery.itemsToPush.length; i < length1; i++){
			gallery.itemsToPush[i] = '<div data-url=\'http://jata.ru'+
				(gallery.itemsToPush[i]) + '\' class=\'gallery__item\'><img src=\'http://jata.ru'+
				(gallery.itemsToPush[i]) + '\' alt><div class=\'gallery__darkness\'></div></div>';
		}

		if (gallery.isWorking) {
			gallery.loadingStart();

			gallery.itemsToPush = $(gallery.itemsToPush.join(''));

			gallery.container
				.append(gallery.itemsToPush);

			gallery.itemsToPush
				.hide()
				.imagesLoaded()
				.progress(function(imgLoad, image) {
					var $item = $(image.img).parents('.gallery__item');

					$item.show();

					gallery.container
						.masonry('appended', $item)
						.masonry();
				})
				.done(function() { 
					callback();
				});

			gallery.itemsToPush = [];
		}
	},

	// запуск подгрузки по скроллу
	scrollLoad		: function() {
		if (gallery.isWorking) {
			var
				pageHeight		=	$(document).height(),
				windowHeight	=	$(window).height(),
				windowScroll	=	$(window).scrollTop();

			var leftToBottom =	pageHeight - windowHeight - windowScroll;

			if (!gallery.isLoading && leftToBottom <= 150) {
				console.log('scrollLoad')
				gallery.otherPushing(function() {
					gallery.loadingEnd(gallery.scrollLoad);
					if (gallery.allItems.length === 0) {
						gallery.fullStop();
					}
				});
			}
		}
	}
};

jQuery(document).ready(function($) {
	gallery.getItems(function() {
		gallery.firstPushing(function() {
			gallery.loadingEnd(gallery.scrollLoad);
		});
	});

	$('body').on('click', '.gallery__btn', function(event) {
		event.preventDefault();
		
		gallery.otherPushing(function() {
			gallery.loadingEnd(gallery.scrollLoad);
		});
	});

	$(window).scroll(function(event) {
		gallery.scrollLoad();
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
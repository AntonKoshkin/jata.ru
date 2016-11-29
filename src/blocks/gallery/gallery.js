/* global $ */

import vars from '../../compile/vars';

const gallery = {
	numToLoad: 20,
	container: $('.gallery'),
	loader   : $('.gallery__loading'),
	moreBtn  : $('.gallery__btn'),
	busy     : true,
	watched  : false,

	urls: {
		all   : [],
		toPush: [],
	},

	items: {
		toPush: null,
	},
	/**
	 * получение списка изображений
	 */
	getUrls() {
		return new Promise((result, error) => {
			let request = new XMLHttpRequest();
			request.open('POST', vars.server + vars.api.gallery);
			request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
			request.onload = () => {
				if (request.status === 200) {
					result(JSON.parse(request.response));
				} else {
					error(Error('Image didn\'t load successfully; error code:' + request.statusText));
				}
			};
			request.onerror = () => {
				error(Error('There was a network error.'));
			};

			request.send(JSON.stringify({tags: ['main']}));
		});
	},
	loadStart() {
		this.busy = true;
		this.loader.show();

		$('.section--gallery .section__content').css('padding-bottom', '50px');
	},
	loadEnd() {
		this.busy = false;
		this.loader.hide();

		$('.section--gallery .section__content').removeAttr('style');
	},
	/**
	 * создание картинок в ДОМе
	 * @param  {Boolean} isFirst первый ли вызов функции
	 */
	makeImgs(isFirst) {
		if (!this.urls.all.length) {
			return;
		}

		if (!isFirst) {
			this.loadStart();
		}

		if (this.urls.all.length >= this.numToLoad) {
			this.urls.toPush = this.urls.all.splice(-this.numToLoad, this.numToLoad);
		} else {
			this.urls.toPush = this.urls.all;
		}

		this.items.toPush = $(this.urls.toPush.join(''));
		this.urls.toPush.length = 0;

		if (isFirst) {
			this.container
				.masonry({
					columnWidth    : '.gallery__item',
					isAnimated     : true,
					isInitLayout   : true,
					isResizable    : true,
					itemSelector   : '.gallery__item',
					percentPosition: true,
					singleMode     : true,
				})
				.append(this.items.toPush);
		} else {
			this.container.append(this.items.toPush);
		}

		this.items.toPush
			.hide()
			.imagesLoaded()
			.progress((imgLoad, image) => {
				const $item = $(image.img).parents('.gallery__item');

				if (this.loader.hasClass('gallery__loading--first')) {
					this.loader.removeClass('gallery__loading--first');
				}

				$item.show();

				this.container
					.masonry('appended', $item)
					.masonry();
			})
			.done(() => {
				this.loadEnd();
				this.onScroll();

				if (!this.watched) {
					$(window).scroll(() => this.onScroll());
				}
			});

		this.items.toPush.length = 0;
	},
	/**
	 * навешиваемая на скролл функция
	 * запускает подгрузку фоток есди надо
	 */
	onScroll() {
		const pageHeight		= $(document).height();
		const windowHeight	= $(window).height();
		const windowScroll	= $(window).scrollTop();
		const leftToBottom	=	pageHeight - windowHeight - windowScroll;

		if (!this.busy && this.urls.all.length && leftToBottom <= 300) {
			console.log('scroll load');
			this.makeImgs();
		}
	},
	/**
	 * инит функция
	 */
	init() {
		$('.gallery__bg').hide();

		this.getUrls()
			.then(
				result => {
					console.log('got images');
					this.urls.all = result.reverse();

					this.urls.all.forEach((elem, i) => {
						this.urls.all[i] = '<div data-url="' + vars.server + elem +
							'" class="gallery__item"><img src="' + vars.server + elem +
							'" alt><div class="gallery__darkness"></div></div>';
					});

					this.makeImgs(true);
				},
				error => {
					console.log(error, 'error');
				}
			);

		$('body').on('click', '.gallery__item', function() {
			let imgUrl = $(this).attr('data-url');

			$('[data-gal-modal]')
				.attr('src', imgUrl)
				.closest('.gallery__bg')
				.fadeIn(300);
		});

		$('body').on('click', '.gallery__bg', function() {
			$(this).fadeOut(300);
		});
	},
};

module.exports = gallery;

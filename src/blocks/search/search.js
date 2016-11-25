const search = {
	neededScroll: null,
	started		: false,
	/**
	 * инит функция
	 */
	init() {
		this.neededScroll = $('.search').offset().top - $(window).height() + $('.search').height() / 2;
		
		$(window).scroll(() => {
			if ($(window).scrollTop() >= this.neededScroll && !this.started) {
				$('.search').addClass('search--animate');
				this.started = true;
			}
		});
	},
};

module.exports = search;
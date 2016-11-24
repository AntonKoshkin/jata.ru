const search = {
	neededScroll: null,
	started		: false,

	init() {
		search.neededScroll = $('.search').offset().top - $(window).height() + $('.search').height() / 2;
		
		$(window).scroll(() => {
			if ($(window).scrollTop() >= search.neededScroll && !search.started) {
				$('.search').addClass('search--animate');
				search.started = true;
			}
		});
	},
};

module.exports = search;
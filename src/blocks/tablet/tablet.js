const tablet = {
	mobOne	: $('#tablet').attr('data-mob-x1'),
	mobTwo	: $('#tablet').attr('data-mob-x2'),
	mobThree	: $('#tablet').attr('data-mob-x3'),
	tabOne	: $('#tablet').attr('data-tab-x1'),
	tabTwo	: $('#tablet').attr('data-tab-x2'),
	tabThree	: $('#tablet').attr('data-tab-x3'),

	init() {
		if (window.devicePixelRatio >= 3) {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', tablet.mobThree);
			} else {
				$('#tablet').attr('data-original', tablet.tabThree);
			}
		} else if (window.devicePixelRatio >= 2) {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', tablet.mobTwo);
			} else {
				$('#tablet').attr('data-original', tablet.tabTwo);
			}
		} else  {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', tablet.mobOne);
			} else {
				$('#tablet').attr('data-original', tablet.tabOne);
			}
		}

		$('#tablet').lazyload({
			threshold: 200,
			effect	: 'fadeIn',
		});
	},
};

module.exports = tablet;
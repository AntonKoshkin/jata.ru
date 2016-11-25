const tablet = {
	mobOne	: $('#tablet').attr('data-mob-x1'),
	mobTwo	: $('#tablet').attr('data-mob-x2'),
	mobThree	: $('#tablet').attr('data-mob-x3'),
	tabOne	: $('#tablet').attr('data-tab-x1'),
	tabTwo	: $('#tablet').attr('data-tab-x2'),
	tabThree	: $('#tablet').attr('data-tab-x3'),
	/**
	 * запускаемая при загрузке функция
	 */
	init() {
		if (window.devicePixelRatio >= 3) {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', this.mobThree);
			} else {
				$('#tablet').attr('data-original', this.tabThree);
			}
		} else if (window.devicePixelRatio >= 2) {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', this.mobTwo);
			} else {
				$('#tablet').attr('data-original', this.tabTwo);
			}
		} else  {
			if ($('html').hasClass('mobile')) {
				$('#tablet').attr('data-original', this.mobOne);
			} else {
				$('#tablet').attr('data-original', this.tabOne);
			}
		}

		$('#tablet').lazyload({
			threshold: 200,
			effect	: 'fadeIn',
		});
	},
};

module.exports = tablet;
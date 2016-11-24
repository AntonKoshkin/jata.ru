const upBtn = {
	setVisibility() {
		if ($(window).scrollTop() >= 800) {
			$('.up-btn').addClass('up-btn--show');
		} else {
			$('.up-btn').removeClass('up-btn--show');
		}
	},
	init() {
		upBtn.setVisibility();

		$(window).scroll(() => {
			upBtn.setVisibility();
		});

		$('body').on('click', '.up-btn', () => {
			$('html, body')
				.stop()
				.animate(
					{scrollTop: 0},
					$(window).scrollTop()/4);
		});
	},
};

module.exports = upBtn;
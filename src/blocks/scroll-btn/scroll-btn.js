const scrollBtn = {
	init() {
		$('body').on('click', '.scroll-btn', event => {
			const elem = event.target;
			event.preventDefault();
			
			$('html, body')
				.animate(
					{scrollTop: $(elem).closest('.section').outerHeight()},
					700);
		});
	},
};

module.exports = scrollBtn;
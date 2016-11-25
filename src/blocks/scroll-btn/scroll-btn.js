const scrollBtn = {
	/**
	 * инит функция
	 */
	init() {
		$('body').on('click', '.scroll-btn', event => {
			const elem = $(event.target).closest('.scroll-btn');
			event.preventDefault();
			
			$('html, body')
				.animate(
					{scrollTop: elem.closest('.section').outerHeight()},
					700);
		});
	},
};

module.exports = scrollBtn;
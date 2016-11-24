const burger = {
	init() {
		$('body').on('click', '.burger', () => {			
			$('.navigation').toggleClass('navigation--open');
		});
	},
};

module.exports = burger;
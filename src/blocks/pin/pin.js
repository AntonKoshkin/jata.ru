const pin = {
	sec		: 55555,
	hours		: new Date().getHours(),
	minutes	: new Date().getMinutes(),
	seconds	: new Date().getSeconds(),
	/**
	 * счетчик, увеличивает время
	 */
	countdown() {
		$('[data-clock=\'h\']').text(Math.floor(pin.sec/3600));
		$('[data-clock=\'m\']').text(Math.floor(pin.sec%3600/60));
		$('[data-clock=\'s\']').text(Math.floor(pin.sec%3600%60));

		pin.sec += 1;
	},
	/**
	 * добавляет к цифре ноль, чтоб получить двузначное число
	 * @param  {number} number цифра или число
	 * @return {number}        двузначное число
	 */
	twoNumbers(number) {
		if (number < 10) {
			number = '0' + number.toString();
		}
		return number;
	},

	setTime() {
		pin.hours = new Date().getHours();
				
		$('[data-clock=\'h\'').text(pin.twoNumbers(pin.hours));

		pin.minutes = new Date().getMinutes();
		
		$('[data-clock=\'m\'').text(pin.twoNumbers(pin.minutes));

		pin.seconds = new Date().getSeconds();
		
		$('[data-clock=\'s\'').text(pin.twoNumbers(pin.seconds));
	},

	init() {
		$('body').on('mouseenter', '.pin', event => {
			event.preventDefault();

			let elem = event.target;

			if (!$(elem).hasClass('pin')) {
				elem = $(elem).closest('.pin');
			}
			
			$(elem)
				.removeClass('pin--show')
				.css('z-index', '2')
				.siblings()
				.removeClass('pin--show')
				.css('z-index', '1');
		});

		if ($('html').hasClass('desktop')) {
			let newDate = new Date();

			newDate.setDate(newDate.getDate());

			$('[data-clock=\'h\'').text(pin.hours);
			$('[data-clock=\'m\'').text(pin.minutes);
			$('[data-clock=\'s\'').text(pin.seconds);

			setInterval(pin.setTime, 1000);

		} else {
			$('[data-clock=\'h\']')
				.text(Math.floor(pin.sec/3600) < 10 ?
							'0' + Math.floor(pin.sec/3600) :
							Math.floor(pin.sec/3600));

			$('[data-clock=\'m\']')
				.text(Math.floor(pin.sec%3600/60) < 10 ?
							'0' + Math.floor(pin.sec%3600/60) :
							Math.floor(pin.sec%3600/60));

			$('[data-clock=\'s\']')
				.text(Math.floor(pin.sec%3600%60) < 10 ?
							'0' + Math.floor(pin.sec%3600%60) :
							Math.floor(pin.sec%3600%60));

			pin.sec += 1;

			setInterval(pin.countdown, 1000);
		}
	},
};

module.exports = pin;
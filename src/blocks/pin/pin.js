/* global $ */

const pin = {
	sec    : 55555,
	hours  : new Date().getHours(),
	minutes: new Date().getMinutes(),
	seconds: new Date().getSeconds(),
	/**
	 * счетчик, увеличивает время
	 */
	countdown() {
		$('[data-clock=\'h\']').text(Math.floor(this.sec / 3600));
		$('[data-clock=\'m\']').text(Math.floor((this.sec % 3600) / 60));
		$('[data-clock=\'s\']').text(Math.floor(this.sec % 3600 % 60));

		this.sec += 1;
	},
	/**
	 * добавляет к цифре ноль, чтоб получить двузначное число
	 * @param  {number} number цифра или число
	 * @return {number}        двузначное число
	 */
	twoNumbers(number) {
		let newNumber = null;

		if (number < 10) {
			newNumber = '0' + number.toString();
		}

		return newNumber;
	},
	/**
	 * обновляет время
	 * вызывается каджую секунду
	 */
	setTime() {
		return () => {
			this.hours = new Date().getHours();

			$('[data-clock=\'h\'').text(this.twoNumbers(this.hours));

			this.minutes = new Date().getMinutes();

			$('[data-clock=\'m\'').text(this.twoNumbers(this.minutes));

			this.seconds = new Date().getSeconds();

			$('[data-clock=\'s\'').text(this.twoNumbers(this.seconds));
		};
	},
	/**
	 * инит функция
	 */
	init() {
		$('body').on('mouseenter', '.pin', event => {
			event.preventDefault();

			let elem = $(event.target).closest('.pin');

			elem
				.removeClass('pin--show')
				.css('z-index', '2')
				.siblings()
				.removeClass('pin--show')
				.css('z-index', '1');
		});

		if ($('html').hasClass('desktop')) {
			let newDate = new Date();

			newDate.setDate(newDate.getDate());

			$('[data-clock=\'h\'').text(this.hours);
			$('[data-clock=\'m\'').text(this.minutes);
			$('[data-clock=\'s\'').text(this.seconds);

			setInterval(this.setTime, 1000);
		} else {
			$('[data-clock=\'h\']')
				.text(Math.floor(this.sec / 3600) < 10 ?
							'0' + Math.floor(this.sec / 3600) :
							Math.floor(this.sec / 3600));

			$('[data-clock=\'m\']')
				.text(Math.floor((this.sec % 3600) / 60) < 10 ?
							'0' + Math.floor((this.sec % 3600) / 60) :
							Math.floor((this.sec % 3600) / 60));

			$('[data-clock=\'s\']')
				.text(Math.floor((this.sec % 3600) % 60) < 10 ?
							'0' + Math.floor((this.sec % 3600) % 60) :
							Math.floor((this.sec % 3600) % 60));

			this.sec += 1;

			setInterval(this.countdown, 1000);
		}
	},
};

module.exports = pin;

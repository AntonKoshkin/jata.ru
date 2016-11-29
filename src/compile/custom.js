'use strict';

import vars			from './vars';

import burger		from '../blocks/burger/burger';
import dotStrip	from '../blocks/dot-strip/dot-strip';
import driverForm	from '../blocks/driver-form/driver-form';
import gallery		from '../blocks/gallery/gallery';
import input		from '../blocks/input/input';
import map			from '../blocks/map/map';
import message		from '../blocks/message/message';
import pin			from '../blocks/pin/pin';
import question	from '../blocks/question/question';
import scrollBtn	from '../blocks/scroll-btn/scroll-btn';
import search		from '../blocks/search/search';
import slidePack	from '../blocks/slide-pack/slide-pack';
import tablet		from '../blocks/tablet/tablet';
import upBtn		from '../blocks/up-btn/up-btn';
import wdSlider	from '../blocks/wd-slider/wd-slider';
import yaMap		from '../blocks/ya-map/ya-map';

require('../../bower_components/jquery_lazyload/jquery.lazyload');
require('device.js');

const jata = {
	/**
	 * запускаемая при загрузке функция
	 */
	ready() {
		if (document.readyState !== 'loading') {
			this.init();
		} else {
			document.addEventListener('DOMContentLoaded', this.init);
		}
	},
	/**
	 * инит функция
	 */
	init() {
		vars.init();
		burger.init();
		upBtn.init();

		switch (window.location.pathname) {
			case '/':
				driverForm.init();
				input.init();
				message.init();
				scrollBtn.init();
				wdSlider.init();
				break;

			case '/foradv.html':
				dotStrip.init();
				map.init();
				pin.init();
				scrollBtn.init();
				search.init();
				slidePack.init();
				tablet.init();
				break;

			case '/contacts.html':
				yaMap.init();
				break;

			case '/how.html':
				question.init();
				break;

			case '/gallery.html':
				gallery.init();
				break;

			// skip default
		}
	},
};

jata.ready();

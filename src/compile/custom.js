'use strict';

import driverForm	from '../blocks/driver-form/driver-form2';
import input		from '../blocks/input/input2';
import message		from '../blocks/message/message';
import burger		from '../blocks/burger/burger';
import scrollBtn	from '../blocks/scroll-btn/scroll-btn';
import wdSlider	from '../blocks/wd-slider/wd-slider';
import tablet		from '../blocks/tablet/tablet';
import search		from '../blocks/search/search';
import pin			from '../blocks/pin/pin';
import map			from '../blocks/map/map';
import slidePack	from '../blocks/slide-pack/slide-pack';
import dotStrip	from '../blocks/dot-strip/dot-strip';
import question	from '../blocks/question/question';
import upBtn		from '../blocks/up-btn/up-btn';
import yaMap		from '../blocks/ya-map/ya-map';
import vars			from './vars';
import gallery		from '../blocks/gallery/gallery2';

require('../../bower_components/jquery_lazyload/jquery.lazyload');
require('device.js');

const jata = {
	ready() {
		if (document.readyState !== 'loading'){
			jata.init();
		} else {
			document.addEventListener('DOMContentLoaded', jata.init);
		}
	},

	init() {
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

			// default:
			// 	location.href = vars.server + '/404.html';
			// 	break;
		}
	},
};

jata.ready();
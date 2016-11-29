'use strict';

const bs			= require('browser-sync');

module.exports = function() {
	return function() {
		bs.init({
			injectChanges: true,
			logPrefix    : 'Server says, that',
			// port				: 7777,
			// server			: 'build',
			proxy        : 'index.jata.ru',
			// tunnel			: true,
		});
	};
};

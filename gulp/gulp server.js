'use strict';

const
	gulp		= require('gulp'),
	bs			= require('browser-sync'),
	config	= require('./config');

module.exports = function() {
	return function() {
		bs.init({
			server			: 'build',
			port				: 7778,
			injectChanges	: true,
			logPrefix		: 'Server says, that',
			// tunnel			: true,
		});
	}
};
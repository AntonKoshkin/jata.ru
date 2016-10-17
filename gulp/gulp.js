'use strict';

const
	gulp		= require('gulp'),
	series	= require('run-sequence'),
	NODE_ENV	= process.env.NODE_ENV || 'development';

module.exports = function() {
	return function() {
		if (NODE_ENV === 'production') {
			return series('build');
		} else {
			return series(
				'build',
				['server',
				'watch']
			);
		}
	}
};
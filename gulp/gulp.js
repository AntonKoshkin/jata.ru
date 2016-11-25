'use strict';

const
	gulp		= require('gulp'),
	series	= require('run-sequence');

module.exports = function() {
	const production	= process.env.NODE_ENV === 'production';
	return function() {
		if (production) {
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
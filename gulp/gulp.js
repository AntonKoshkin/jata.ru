'use strict';

const
	gulp		= require('gulp'),
	series	= require('run-sequence');

module.exports = function() {
	return function() {
		return series(
			'build',
			['server',
			'watch']
		);
	}
};
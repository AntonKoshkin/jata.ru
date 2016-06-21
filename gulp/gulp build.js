'use strict';

const
	gulp		= require('gulp'),
	series	= require('run-sequence');

module.exports = function() {
	return function(cb) {
		return series(
			'clean',
			[
				'assets',
				'img',
				'jade',
				// 'angJade',
				'js',
				'stylus',
				'svgSprite',
				'video'
			],
			cb
		);
	}
};
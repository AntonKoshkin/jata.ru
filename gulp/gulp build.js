'use strict';

const
	gulp			= require('gulp'),
	series		= require('run-sequence');

module.exports = function() {
	const production	= process.env.NODE_ENV === 'production';
	return function(cb) {
		if (production) {
			return series(
				'clean',
				[
					'js',
					'stylus',
				],
				[
					'assets',
					'img',
					// 'jslint',
					// 'svgSprite',
					'video',
					'jade',
				],
				cb
			);
		} else {
			return series(
				'clean',
				[
					'assets',
					'img',
					// 'jslint',
					'js',
					'stylus',
					// 'svgSprite',
					'video',
					'jade',
				],
				cb
			);
		}
	}
};
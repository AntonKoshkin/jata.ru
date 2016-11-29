'use strict';

const series = require('run-sequence');

module.exports = function() {
	const production = process.env.NODE_ENV === 'production';
	return function(cb) {
		if (production) {
			return series(
				'clean',
				[
					'jslint',
					'js',
					'stylus'
				],
				[
					'assets',
					'img',
					// 'svgSprite',
					'video',
					'jade'
				],
				cb
			);
		}

		return series(
			'clean',
			[
				'assets',
				'img',
				'jslint',
				'js',
				'stylus',
				// 'svgSprite',
				'video',
				'jade'
			],
			cb
		);
	};
};

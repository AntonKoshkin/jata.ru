'use strict';

const
	config	= require('./config'),
	gulp		= require('gulp'),
	gulpIf	= require('gulp-if'),
	newer		= require('gulp-newer');

module.exports = function() {
	return function() {
		var ifFileIsJs = function(file) {
			const a = file.path.split('.'),
					b = a.length - 1;

			if (file.path.split('.')[b] === 'js') {
				return true;
			} else {
				return false;
			}
		};

		return gulp
			.src(config.pathTo.src.assets)
			.pipe(gulpIf(
				ifFileIsJs,
				gulp.dest(config.pathTo.build.assets.js),
				gulp.dest(config.pathTo.build.assets.fonts)
			));
	}
}

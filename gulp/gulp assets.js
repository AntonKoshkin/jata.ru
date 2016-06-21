'use strict';

const
	config	= require('./config'),
	gulp		= require('gulp'),
	gulpIf	= require('gulp-if');

module.exports = function() {
	return function() {
		var ifFileIsBc = function(file) {
			if (file.path.split('\\')[2] === 'bower_components') {
				return true;
			} else {
				return false;
			}
		};

		return gulp
			.src(config.pathTo.src.assets)
			.pipe(gulpIf(
				ifFileIsBc,
				gulp.dest(config.pathTo.build.assets.js),
				gulp.dest(config.pathTo.build.assets.else)
			));
	}
}

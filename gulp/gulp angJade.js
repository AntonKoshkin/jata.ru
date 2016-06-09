'use strict';

const
	debug		= require('gulp-debug'),
	gulp		= require('gulp'),
	config	= require('./config'),
	jade		= require('gulp-jade'),
	plumber	= require('gulp-plumber');

module.exports = function() {
	return function() {
		return gulp
			.src(config.pathTo.src.angJade)
			.pipe(plumber())
			.pipe(debug())
			.pipe(jade({
				pretty: '\t'
			}))
			.pipe(gulp.dest(config.pathTo.build.angJade));
	}
};
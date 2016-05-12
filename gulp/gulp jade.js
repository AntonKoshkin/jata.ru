'use strict';

const
	gulp		= require('gulp'),
	config	= require('./config'),
	jade		= require('gulp-jade'),
	plumber	= require('gulp-plumber'),
	server	= require('browser-sync');

module.exports = function() {
	return function() {
		return gulp
			.src(config.pathTo.src.jade)
			.pipe(plumber())
			.pipe(jade({
				pretty: '\t'
			}))
			.pipe(gulp.dest(config.pathTo.build.jade))
			.pipe(server.reload({stream:true}));
	}
};
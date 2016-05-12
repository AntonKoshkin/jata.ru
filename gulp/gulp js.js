'use strict';

const
	concat	= require('gulp-concat'),
	config	= require('./config'),
	filter	= require('gulp-filter'),
	gulp		= require('gulp'),
	gulpIf	= require('gulp-if'),
	jsHint	= require('gulp-jshint'),
	plumber	= require('gulp-plumber'),
	rigger	= require('gulp-rigger'),
	server	= require('browser-sync'),
	stylish	= require('jshint-stylish'),
	uglify	= require('gulp-uglify');

module.exports = function() {
	return function() {
		const f = filter(['**\\jsCustom.js'], {
			restore: true
		});

		return gulp.src(config.pathTo.src.js)
			.pipe(plumber())
			.pipe(rigger())
			.pipe(f)
			.pipe(jsHint())
			.pipe(jsHint.reporter(stylish))
			.pipe(f.restore)
			.pipe(concat('main.js'))
			.pipe(gulpIf(
				!config.isDev,
				uglify()))
			.pipe(gulp.dest(config.pathTo.build.js))
			.pipe(server.reload({stream:true}));
	};
}
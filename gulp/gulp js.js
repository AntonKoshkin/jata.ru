'use strict';

const
	combine	= require('stream-combiner2').obj,
	concat	= require('gulp-concat'),
	config	= require('./config'),
	debug		= require('gulp-debug'),
	filter	= require('gulp-filter'),
	gulp		= require('gulp'),
	gulpIf	= require('gulp-if'),
	jsHint	= require('gulp-jshint'),
	plumber	= require('gulp-plumber'),
	rev		= require('gulp-rev'),
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
				combine(
					uglify(),
					rev()
				)
			))
			.pipe(gulp.dest(config.pathTo.build.js))
			.pipe(gulpIf(
				!config.isDev,
				combine(
					rev.manifest('manifests/manifest.json', {
						merge: true,
					}),
					debug(),
					gulp.dest('')
				)
			))
			.pipe(server.reload({stream:true}));
	};
}
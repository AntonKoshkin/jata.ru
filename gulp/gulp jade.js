'use strict';

const
	gulp		= require('gulp'),
	config	= require('./config'),
	gulpIf	= require('gulp-if'),
	jade		= require('gulp-jade'),
	plumber	= require('gulp-plumber'),
	rev		= require('gulp-rev'),
	replace	= require('gulp-rev-replace'),
	server	= require('browser-sync');

module.exports = function() {
	return function() {
		return gulp
			.src(config.pathTo.src.jade)
			.pipe(plumber())
			.pipe(jade({
				pretty: '\t',
			}))
			.pipe(replace({
				manifest: gulp.src('./manifests/manifest.json'),
			}))
			.pipe(gulp.dest(config.pathTo.build.jade))
			.pipe(server.reload({stream:true}));
	}
};
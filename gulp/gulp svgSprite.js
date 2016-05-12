'use strict';

const
	config	= require('./config'),
	gulp		= require('gulp'),
	plumber	= require('gulp-plumber'),
	rename	= require('gulp-rename'),
	server	= require('browser-sync'),
	svgStore	= require('gulp-svgstore');


module.exports = function() {
	return function() {
		return gulp
			.src(config.pathTo.src.svgSprite)
			.pipe(plumber())
			.pipe(svgStore())
			.pipe(rename('svg-sprite.svg'))
			.pipe(gulp.dest(config.pathTo.build.svgSprite))
			.pipe(server.reload({stream:true}));
	}
}
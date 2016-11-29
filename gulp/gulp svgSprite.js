'use strict';

const config	= require('./config');
const gulp		= require('gulp');
const plumber	= require('gulp-plumber');
const rename	= require('gulp-rename');
const server	= require('browser-sync');
const svgStore	= require('gulp-svgstore');


module.exports = function() {
	return function() {
		return gulp
			.src(config.pathTo.src.svgSprite)
			.pipe(plumber())
			.pipe(svgStore())
			.pipe(rename('svg-sprite.svg'))
			.pipe(gulp.dest(config.pathTo.build.svgSprite))
			.pipe(server.reload({stream: true}));
	};
};

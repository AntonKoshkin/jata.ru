'use strict';

const config	= require('./config');
const gulp		= require('gulp');
const watch		= require('gulp-watch');

module.exports = function() {
	return function() {
		watch(config.pathTo.watch.stylus, function() {
			gulp.start('stylus');
		});
		watch(config.pathTo.watch.jade, function() {
			gulp.start('jade');
		});
		watch(config.pathTo.watch.img, function() {
			gulp.start('img');
		});
		watch(config.pathTo.watch.js, function() {
			gulp.start('jslint');
		});
		watch(config.pathTo.watch.js, function() {
			gulp.start('js');
		});
		watch(config.pathTo.watch.svgSprite, function() {
			gulp.start('svgSprite');
		});
		watch(config.pathTo.watch.assets, function() {
			gulp.start('assets');
		});
		watch(config.pathTo.watch.video, function() {
			gulp.start('video');
		});
	};
};

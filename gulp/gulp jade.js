'use strict';

const gulp			= require('gulp');
const config		= require('./config');
const gulpIf		= require('gulp-if');
const jade			= require('gulp-jade');
const plumber		= require('gulp-plumber');
const replace		= require('gulp-rev-replace');
const server		= require('browser-sync');

module.exports = function() {
	const production	= process.env.NODE_ENV === 'production';
	return function() {
		return gulp
			.src(config.pathTo.src.jade)
			.pipe(plumber())
			.pipe(jade({
				pretty: '\t',
			}))
			.pipe(gulpIf(
				production,
				replace({manifest: gulp.src('./manifests/manifest.json')})
			))
			.pipe(gulp.dest(config.pathTo.build.jade))
			.pipe(server.reload({stream: true}));
	};
};

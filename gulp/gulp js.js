'use strict';

const
	babelify		= require('babelify'),
	browserify	= require('browserify'),
	buffer		= require('gulp-buffer'),
	combine		= require('stream-combiner2').obj,
	config		= require('./config'),
	// debug			= require('gulp-debug'),
	gulp			= require('gulp'),
	gulpIf		= require('gulp-if'),
	rev			= require('gulp-rev'),
	server		= require('browser-sync'),
	source		= require('vinyl-source-stream'),
	uglify		= require('gulp-uglify'),

	production	= process.env.NODE_ENV === 'production';

module.exports = function() {
	return function() {

		return browserify({
			entries		: config.pathTo.src.js,
			extensions	: ['.js'],
			debug			: !production,
		})
			.transform(babelify)
			.bundle()
			.pipe(source('main.js'))
			.pipe(buffer())
			.pipe(gulpIf(
				production,
				combine(
					uglify(),
					rev()
				)
			))
			.pipe(gulp.dest(config.pathTo.build.js))
			.pipe(gulpIf(
				production,
				combine(
					rev.manifest('manifests/manifest.json', {merge: true}),
					gulp.dest('')
				)
			))
			.pipe(server.reload({stream:true}));
	};
}
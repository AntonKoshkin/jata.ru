'use strict';

const babelify		= require('babelify');
const browserify	= require('browserify');
const buffer		= require('gulp-buffer');
const combine		= require('stream-combiner2').obj;
const config		= require('./config');
// const debug			= require('gulp-debug');
const gulp			= require('gulp');
const gulpIf		= require('gulp-if');
const notifier		= require('node-notifier');
const replace		= require('gulp-replace');
const rev			= require('gulp-rev');
const server		= require('browser-sync');
const source		= require('vinyl-source-stream');
const uglify		= require('gulp-uglify');

module.exports = function() {
	const production	= process.env.NODE_ENV === 'production';
	return function() {
		return browserify({
			entries      : config.pathTo.src.js,
			debug        : true,
			insertGlobals: true,
			detectGlobals: true,
		})
			.transform(babelify)
			.bundle()
			.on('error', function(err) {
				console.log(err.stack);

				notifier.notify({
					title  : 'Compile Error',
					message: err.message,
				});

				this.emit('end');
			})
			.pipe(source('main.js'))
			.pipe(buffer())
			.pipe(replace('environment', () => process.env.NODE_ENV))
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
			.pipe(server.reload({stream: true}));
	};
};

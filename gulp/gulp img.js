'use strict';

const config	= require('./config');
// const debug		= require('gulp-debug');
const gulp		= require('gulp');
const imageMin	= require('gulp-imagemin');
const newer		= require('gulp-newer');
const plumber	= require('gulp-plumber');
const pngQuant	= require('imagemin-pngquant');
const server	= require('browser-sync');

module.exports = function() {
	return function() {
		return gulp
			.src(config.pathTo.src.img)
			.pipe(plumber())
			.pipe(newer(config.pathTo.build.img))
			.pipe(imageMin({
				intarlaced       : true,
				optimizationLevel: 5,
				progressive      : true,
				arithmetic       : true,
				svgoPlugins      : [{
					removeViewBox: true,
				}],
				use: [
					pngQuant({
						quality: '65-80',
						speed  : 6,
						verbose: true,
					})
				],
			}))
			// .pipe(debug())
			.on('data', function(file) {
				const a = file.path.split(/\/|\\/);

				a.splice(-2, 1);
				const c = a.join('/');
				file.path = c;

				return file;
			})
			.pipe(gulp.dest(config.pathTo.build.img))
			.pipe(server.reload({stream: true}));
	};
};

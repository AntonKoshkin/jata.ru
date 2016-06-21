'use strict';

const
	config	= require('./config'),
	gulp		= require('gulp'),
	imageMin	= require('gulp-imagemin'),
	newer		= require('gulp-newer'),
	plumber	= require('gulp-plumber'),
	pngQuant	= require('imagemin-pngquant'),
	server	= require('browser-sync');

module.exports = function() {
	return function() {
		return gulp
			.src(config.pathTo.src.img)
			.pipe(plumber())
			.pipe(newer(config.pathTo.build.img))
			.pipe(imageMin({
				intarlaced			: true,
				optimizationLevel	: 5,
				progressive			: true,
				arithmetic			: true,
				svgoPlugins			: [{
					removeViewBox	: true,
				}],
				use					: [pngQuant({
					quality			: '65-80',
					speed				: 6,
					verbose			: true,
				})],
			}))
			.on('data', function(file) {
				const a = file.path.split('\\'),
						b = a.length - 2;

				a.splice(b, 1);
				const c = a.join('\\');
				file.path = c;

				return file;
			})
			.pipe(gulp.dest(config.pathTo.build.img))
			.pipe(server.reload({stream:true}));
	}
};
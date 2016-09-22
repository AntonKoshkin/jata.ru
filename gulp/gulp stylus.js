'use strict';

const
	combine	= require('stream-combiner2').obj,
	config	= require('./config'),
	gulp		= require('gulp'),
	gulpIf	= require('gulp-if'),
	maps		= require('gulp-sourcemaps'),
	notify	= require('gulp-notify'),
	plumber	= require('gulp-plumber'),
	rename	= require('gulp-rename'),
	rev		= require('gulp-rev'),
	server	= require('browser-sync'),
	stylus	= require('gulp-stylus'),

	// postCSS and it's plagins
	postCss	= require('gulp-postcss'),
	cssComb	= require('postcss-sorting'),
	cssLint	= require('stylelint'),
	cssNano	= require('cssnano'),
	doiuse	= require('doiuse'),
	flexFix	= require('postcss-flexbugs-fixes'),
	fonts		= require('postcss-font-magician'),
	prefixes	= require('autoprefixer'),
	short		= require('postcss-short');

module.exports = function() {
	return function() {
		return gulp
			.src(config.pathTo.src.stylus)
			.pipe(plumber())
			.pipe(gulpIf(
				config.isDev,
				maps.init()))
			.pipe(stylus({'include css': true}))
			.pipe(postCss([
				// fonts({
				// 	formats: 'woff'
				// }),
				// short(),
				// flexFix(),
				prefixes({browsers: [
					'> 1%',
					'ie > 9',
					'last 3 versions']
				}),
				// cssComb({'sort-order': 'zen'}),
				// cssLint({'extends':'src/'}),
			]))
			.on('error', notify.onError())
			.pipe(gulp
				.dest(config.pathTo.build.stylus))
			.pipe(gulpIf(
				config.isDev,
				combine(
					maps.write('.')
				),
				postCss([
					cssNano(),
					doiuse({browsers: 'last 2 versions'})
				])
			))
			.pipe(gulpIf(!config.isDev, rev()))
			.pipe(gulp.dest(config.pathTo.build.stylus))
			.pipe(gulpIf(
				!config.isDev,
				combine(
					rev.manifest('manifests/manifest.json', {
						merge: true,
					}),
					gulp.dest('')
				)
			))
			.pipe(server.reload({stream:true}));
	};
}
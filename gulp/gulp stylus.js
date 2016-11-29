'use strict';

const combine	= require('stream-combiner2').obj;
const config	= require('./config');
const gulp		= require('gulp');
const gulpIf	= require('gulp-if');
const maps		= require('gulp-sourcemaps');
const notify	= require('gulp-notify');
const plumber	= require('gulp-plumber');
const rev		= require('gulp-rev');
const server	= require('browser-sync');
const stylus	= require('gulp-stylus');

	// postCSS and it's plagins
const postCss	= require('gulp-postcss');
// const cssLint	= require('stylelint');
const cssNano	= require('cssnano');
const flexFix	= require('postcss-flexbugs-fixes');
const prefixes	= require('autoprefixer');

module.exports = function() {
	const production	= process.env.NODE_ENV === 'production';
	return function() {
		return gulp
			.src(config.pathTo.src.stylus)
			.pipe(plumber())
			.pipe(gulpIf(
				!production,
				maps.init()))
			.pipe(stylus({'include css': true}))
			.pipe(postCss([
				flexFix(),
				prefixes({
					browsers: [
						'> 1%',
						'ie > 9',
						'last 3 versions'
					],
				})
				// cssLint({'extends':'src/'}),
			]))
			.on('error', notify.onError())
			.pipe(gulp.dest(config.pathTo.build.stylus))
			.pipe(gulpIf(
				!production,
				combine(
					maps.write('.')
				),
				combine(
					postCss([
						cssNano()
					]),
					rev()
				)
			))
			.pipe(gulp.dest(config.pathTo.build.stylus))
			.pipe(gulpIf(
				production,
				combine(
					rev.manifest('manifests/manifest.json', {
						merge: true,
					}),
					gulp.dest('')
				)
			))
			.pipe(server.reload({stream: true}));
	};
};

'use strict';

const config	= require('./config');
const eslint	= require('gulp-eslint');
const gulp		= require('gulp');
const notify	= require('gulp-notify');
const plumber	= require('gulp-plumber');

module.exports = function() {
	const production = process.env.NODE_ENV === 'production';

	return function() {
		if (production) {
			return gulp
				.src(config.pathTo.src.allJs)
				.pipe(plumber({errorHandler: notify.onError({message: 'lint errors'})}))
				.pipe(eslint({configFile: config.eslintrc}))
				.pipe(eslint.format())
				.pipe(eslint.failAfterError());
		}

		return gulp
			.src(config.pathTo.src.allJs)
			.pipe(plumber({errorHandler: notify.onError({message: 'lint errors'})}))
			.pipe(eslint({configFile: config.eslintrc}))
			.pipe(eslint.format())
			.pipe(eslint.failAfterError());
	};
};

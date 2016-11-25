'use strict';

const
	config	= require('./config'),
	events	= require('events'),
	emmitter	= new events.EventEmitter(),
	gulp		= require('gulp'),
	jsHint	= require('gulp-jshint'),
	map		= require('map-stream'),
	notify	= require('gulp-notify'),
	plumber	= require('gulp-plumber'),
	stylish	= require('jshint-stylish');

module.exports = function() {
	return function() {

		const jsHintErrorReporter = (file, cb) => {
			return map((file, cb) => {
				if (!file.jsHint.success) {
					file.jsHint.results.forEach(err => {
						if (err) {
							emmitter.emit('error');
						}
					});
				}
				cb(null, file);
			});
		};

		return gulp
			.src(config.pathTo.src.allJs)
			.pipe(plumber({
				errorHandler: notify.onError({
					message: 'lint errors'
				})
			}))
			.pipe(jsHint(config.jsHintRules))
			.pipe(jsHint.reporter(stylish))
			.pipe(jsHintErrorReporter());
	};
}

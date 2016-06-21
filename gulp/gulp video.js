'use strict';

const
	config	= require('./config'),
	gulp		= require('gulp');

module.exports = function() {
	return function() {
		return gulp
			.src(config.pathTo.src.video)
			.on('data', function(file) {
				const a = file.path.split('\\'),
						b = a.length - 2;

				a.splice(b, 1);
				const c = a.join('\\');
				file.path = c;

				return file;
			})
			.pipe(gulp.dest(config.pathTo.build.video));
	}
}

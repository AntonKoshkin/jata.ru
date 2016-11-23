'use strict';

const
	bs		= require('browser-sync').create(),
	gulp	= require('gulp');

// Lazy Task Run function
function lazyRequireTask(taskName, path) {
	gulp.task(taskName, function(callback) {
		let task = require(path).call(this);

		return task(callback);
	});
}

// task Clean
lazyRequireTask('clean', './gulp/gulp clean.js');

// task Jade
lazyRequireTask('jade', './gulp/gulp jade.js');

// task Jade for Angular
// lazyRequireTask('angJade', './gulp/gulp angJade.js');

// task Server
lazyRequireTask('server', './gulp/gulp server.js');

// task Stylus
lazyRequireTask('stylus', './gulp/gulp stylus.js');

// task JavaScript
lazyRequireTask('js', './gulp/gulp js.js');

// task JavaScript linting
// lazyRequireTask('jslint', './gulp/gulp jslint.js');

// task Images
lazyRequireTask('img', './gulp/gulp img.js');

// task SVG Sprites
lazyRequireTask('svgSprite', './gulp/gulp svgSprite.js');

// task Watch
lazyRequireTask('watch', './gulp/gulp watch.js');

// task Build
lazyRequireTask('build', './gulp/gulp build.js');

// task Assets
lazyRequireTask('assets', './gulp/gulp assets.js');

// task Video
lazyRequireTask('video', './gulp/gulp video.js');

// task Default
lazyRequireTask('default', './gulp/gulp.js');
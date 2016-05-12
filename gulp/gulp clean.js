'use srtict';

const
	gulp		= require('gulp'),
	del		= require('del'),
	config	= require('./config');

module.exports = function() {
	return function() {
		return del([config.pathTo.clean], {
			force: true
		});
	}
}
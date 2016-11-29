'use srtict';

const del		= require('del');
const config	= require('./config');

module.exports = function() {
	return function() {
		return del([config.pathTo.clean], {force: true});
	};
};

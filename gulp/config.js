'use strict';

// const buildRoot = '../../OpenServer/domains/admin.jata.ru';
const buildRoot = 'build';

module.exports = {
	isDev		: false,
	pathTo	: {
		src	: {
			angJade		: 'src/forAng/**/*.jade',
			assets		: [
				'bower_components/jquery/dist/jquery.min.js',
				'bower_components/masonry/dist/masonry.pkgd.min.js',
				'bower_components/imagesloaded/imagesloaded.pkgd.min.js',
				'src/assets/**/*.*',
			],
			img			: [
				'src/blocks/**/*.{jpg,png,svg}',
				'!src/blocks/**/svg-*.svg',
			],
			jade			: 'src/layouts/*.jade',
			js				: [
				'src/compile/jsVendor.js',
				'src/compile/jsCustom.js'
			],
			pngSprite	: 'src/blocks/**/png-*.png',
			stylus		: 'src/compile/style.styl',
			svgSprite	: 'src/blocks/**/svg-*.svg',
			video			: 'src/blocks/**/*.mp4',
		},
		build	: {
			angJade		: '../dev/jade/',
			assets		: {
				else	: buildRoot,
				js		: buildRoot + '/js/',
			},
			img			: buildRoot + '/img/',
			jade			: buildRoot + '/',
			js				: buildRoot + '/js/',
			pngSprite	: buildRoot + '/img/',
			stylus		: buildRoot + '/css/',
			svgSprite	: buildRoot + '/img/',
			video			: buildRoot + '/video/',
		},
		watch	: {
			angJade		: 'src/forAng/*.jade',
			assets		: 'src/assets/**/*.*',
			all			: 'src/**/*.*',
			img			: [
				'src/blocks/**/*.(jpg|png|svg)',
				'!src/blocks/**/svg-*.svg',
			],
			jade			: 'src/**/*.jade',
			js				: 'src/**/*.js',
			pngSprite	: 'src/blocks/**/png-*.png',
			stylus		: 'src/**/*.styl',
			svgSprite	: 'src/blocks/**/svg-*.svg',
			video			: 'src/blocks/**/*.mp4',
		},
		clean	: buildRoot + '/*',
	},
};
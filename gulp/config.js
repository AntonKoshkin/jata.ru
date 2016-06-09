'use strict';

module.exports = {
	isDev		: true,
	pathTo	: {
		src	: {
			angJade		: 'src/forAng/**/*.jade',
			assets		: [
				'bower_components/jquery/dist/jquery.min.js',
				'src/assets/fonts/**/*.*',
				'src/assets/js/*.*',
			],
			img			: [
				'src/blocks/**/*.{jpg,png,svg}',
				'!src/blocks/**/svg-*.svg',
			],
			jade			: 'src/layouts/*.jade',
			js				: 'src/compile/*.js',
			pngSprite	: 'src/blocks/**/png-*.png',
			stylus		: 'src/compile/style.styl',
			svgSprite	: 'src/blocks/**/svg-*.svg',
		},
		build	: {
			angJade		: '../dev/jade/',
			assets		: {
				fonts	: 'build/fonts/',
				js		: 'build/js/',
			},
			img			: 'build/img/',
			jade			: 'build/',
			js				: 'build/js/',
			pngSprite	: 'build/img/',
			stylus		: 'build/css/',
			svgSprite	: 'build/img/',
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
		},
		clean	: 'build/*',
	},
};
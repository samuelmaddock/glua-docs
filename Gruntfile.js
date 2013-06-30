'use strict';

module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		concat: {
			js: {
				src: 'src/js/*.js',
				dest: 'src/js/concat.js'
			}
		},

		uglify: {
			app: {
				files: {
					'app/js/gluadocs.min.js' : ['src/js/concat.js']
				},
			}
		},

		cssmin: {
			app: {
				files: {
					'app/css/style.css' : ['src/css/style.css','src/css/lua-obsidian.css']
				}
			}
		},

		htmlmin: {
			app: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					'app/index.html' : 'src/index.html'
				}
			}
		},

		manifest: {
			generate: {
				options: {
					basePath: 'app/',
					cache: [
						'index.html',
						'css/style.css',
						'data/glua.json',
						'js/gluadocs.min.js',
						'js/lib/angular.min.js',
						'js/lib/rainbow-custom.min.js',
						'fonts/Roboto-Regular-webfont.svg'
					],
					verbose: false,
					timestamp: true
				},
				src: [
					'src/index.html'
				],
				dest: 'app/manifest.appcache'
			}
		},

		clean: ['src/js/concat.js']

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-manifest');

	grunt.registerTask('default', ['concat','uglify','cssmin','htmlmin','manifest','clean']);

};
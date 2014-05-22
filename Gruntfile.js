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
			prod: {
				files: {
					'app/js/gluadocs.min.js' : ['src/js/concat.js']
				},
			}
		},

		cssmin: {
			prod: {
				files: {
					'app/css/style.min.css' : [
						'src/css/style.css',
						'src/css/font-awesome.min.css',
						'src/css/lua-obsidian.css'
					]
				}
			}
		},

		htmlmin: {
			prod: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					'app/index.html' : 'app/index.html'
				}
			}
		},

		manifest: {
			generate: {
				options: {
					basePath: 'app/',
					cache: [
						'index.html',
						'data/glua.json',
						'css/style.min.css',
						'js/gluadocs.min.js',
						'js/lib/angular.min.js',
						'js/lib/rainbow-custom.min.js',
						'font/Roboto-Regular-webfont.svg',
						'font/fontawesome-webfont.svg'
					],
					verbose: false,
					timestamp: true
				},
				src: [
					'app/index.html'
				],
				dest: 'app/manifest.appcache'
			}
		},

		devcode: {
			options: {
				html: true,
				clean: true,
				block: {
					open: 'devcode',
					close: 'endcode'
				}
			},
			prod: {
				options: {
					source: 'src/',
					dest: 'app/',
					env: 'prod'
				}
			},
			dev: {
				options: {
					source: 'src/',
					dest: 'dev/',
					env: 'dev'
				}
			}
		},

		copy: {
			prod: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: ['js/lib/*','data/*','font/*','favicon.png'],
						dest: 'app/'
					}
				]
			},
			dev: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: ['*/**'],
						dest: 'dev/'
					}
				]
			}
		},

		watch: {
			scripts: {
				files: ['src/**/*'],
				tasks: ['devcode:dev','copy:dev']
			}
		},

		clean: ['src/js/concat.js']

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-devcode');
	grunt.loadNpmTasks('grunt-manifest');

	grunt.registerTask('dev', [
		'devcode:dev',
		'copy:dev',
		'watch'
	]);

	grunt.registerTask('prod', [
		'devcode:prod',
		'copy:prod',
		'concat',
		'uglify:prod',
		'cssmin:prod',
		'htmlmin:prod',
		'manifest',
		'clean'
	]);

};

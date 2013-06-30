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

		clean: ['src/js/gluadocs.js']

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-manifest');

	grunt.registerTask('default', ['concat','uglify','htmlmin','clean']);

};
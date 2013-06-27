'use strict';

module.exports = function(grunt) {

	grunt.initConfig({

		meta: {
			basePath: '../',
			srcPath: '../src/',
			deployPath: '../app/'
		},

		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> ',

		uglify: {
			options: {},
			my_target: {
				files: {
					
				}
			}
		},

		compass: {
			build: {
				options: {
					sassDir: '../src/sass',
					cssDir: '../app/css',
					outputStyle: 'compressed'
				}
			}
		},

		watch: {
			files: '../src/**.*',
			tasks: ['default'],
			options: {
				livereload: true
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['uglify','compass']);

}
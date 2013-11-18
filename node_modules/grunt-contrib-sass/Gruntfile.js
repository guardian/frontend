/*
 * grunt-contrib-sass
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Sindre Sorhus, contributors
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ]
    },
    clean: {
      test: [
        'test/tmp',
        '.sass-cache'
      ]
    },
    nodeunit: {
      tests: ['test/*_test.js']
    },
    sass: {
      options: {
        //debugInfo: true,
       // style: 'expanded'
      },
      compile: {
        files: {
          'test/tmp/scss.css': ['test/fixtures/compile.scss'],
          'test/tmp/sass.css': ['test/fixtures/compile.sass'],
          'test/tmp/css.css': ['test/fixtures/compile.css']
        }
      }
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-internal');

  grunt.registerTask('mkdir', grunt.file.mkdir);
  grunt.registerTask('test', [
    'clean',
    'mkdir:tmp',
    'sass',
    'nodeunit',
    'clean'
  ]);
  grunt.registerTask('default', ['jshint', 'test', 'build-contrib']);
};

/*
 * grunt-webfontjson
 * https://github.com/ahume/grunt-webfontjson
 *
 * Copyright (c) 2013 Andy Hume
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    webfontjson: {
      woff: {
        options: {
          "filename": "test/MyriadPro.otf.json",
          "callback": "myCallback",
          "fonts": [
            {
              "font-family": "WebFont-MyriadPro",
              "font-weight": "normal",
              "file": "/Library/Fonts/MyriadPro-Regular.otf",
              "format": "otf"
            },
            {
              "font-family": "WebFont-MyriadPro",
              "font-weight": "bold",
              "file": "/Library/Fonts/MyriadPro-Bold.otf",
              "format": "otf"
            }
          ]
        }
      },
      ttf: {
        options: {
          "filename": "test/MyriadPro.ttf.json",
          "fonts": [
            {
              "font-family": "WebFont-MyriadPro",
              "font-weight": "normal",
              "file": "/Library/Fonts/MyriadPro-Regular.otf",
              "format": "ttf"
            },
            {
              "font-family": "WebFont-MyriadPro",
              "font-weight": "bold",
              "file": "/Library/Fonts/MyriadPro-Bold.otf",
              "format": "ttf"
            }
          ]
        }
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'webfontjson', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};

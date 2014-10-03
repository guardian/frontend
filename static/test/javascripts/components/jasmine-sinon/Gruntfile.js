module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({
    jasmine_node: {
      forceExit: true,
      isVerbose: false,
      projectRoot: 'spec'
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'lib/jasmine-sinon.js']
    },

    karma: {
      options: {
        configFile: 'karma.conf.coffee'
      },
      dev: {
        reporters: 'dots'
      },
      ci: {
        singleRun: true,
        browsers: ['Firefox']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jasmine-node');

  grunt.registerTask('test', ['jshint', 'karma:ci', 'jasmine_node']);
  grunt.registerTask('default', 'test');
  grunt.registerTask('travis', ['jshint', 'karma:ci', 'jasmine_node']);

};

module.exports = function(grunt) {

  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-shell');

  grunt.initConfig({
    // jasmine_node: {
    //   options: {
    //     forceExit: true,
    //     isVerbose: false
    //   },
    //   all: ['spec/']
    // },

    shell: {
      nodespecs: {
        command: 'node_modules/.bin/jasmine-node spec/'
      }
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

  grunt.registerTask('test', ['jshint', 'karma:ci', 'shell:nodespecs']);
  grunt.registerTask('default', 'test');
  grunt.registerTask('travis', 'default');

};

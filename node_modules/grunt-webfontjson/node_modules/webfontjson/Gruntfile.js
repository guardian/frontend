module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    
    connect: {
      server: {
        options: {
          port: 9001,
          base: 'test'
        }
      }
    },


    nodeunit: {
      all: ['test/test.js']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

};
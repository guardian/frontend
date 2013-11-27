module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    hash: {
      php: {
        options: {
          mapping: 'out/assets.php'
        },
        src: 'examples/*.js',
        dest: 'out/dist/php/'
      },
      json: {
        options: {
          mapping: 'out/assets.json'
        },
        src: 'examples/*.js',
        dest: 'out/dist/json/'
      },
      single: {
        options: {
          mapping: 'out/single.json'
        },
        src: 'examples/test1.js',
        dest: 'out/dist/single/'
      },
      no_map: {
        src: 'examples/*.js',
        dest: 'out/dist/no_map/'
      },
      path: {
        options: {
          mapping: 'out/path.json',
          destBasePath: 'out/',
          srcBasePath: 'examples/'
        },
        src: 'examples/**/*.js',
        dest: 'out/dist/path/'
      },
      flatten: {
        options: {
          mapping: 'out/flatten.json',
          flatten: true
        },
        src: 'examples/**/*.js',
        dest: 'out/dist/flatten/'
      },
      no_dest: {
        options: {
          mapping: 'out/no_dest.json'
        },
        src: 'examples/test1.js'
      }
    },
    watch: {
      files: '<%= jshint.all %>',
      tasks: 'default'
    },
    jshint: {
      all: ['Gruntfile.js', 'tasks/**/*.js', 'test/**/*.js']
    },
    clean: [
      'out/', 
      'examples/test1.*.js'
    ],
    simplemocha: {
      options: {
        ui: 'tdd',
        reporter: 'Spec'
      },
      all: { src: 'test/**/*.js' }
    }
  });
  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', ['clean', 'jshint', 'hash', 'simplemocha']);
  grunt.registerTask('dev', ['watch']);


};

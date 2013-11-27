module.exports = function(grunt) {
  this.initConfig({
    coffee: {
      all: {
        options: {
          bare: true
        },
        expand: true,
        cwd: 'src',
        src: ['*.coffee'],
        dest: 'tasks',
        ext: '.js'
      }
    },
    clean: {
      all: ['tasks', 'tmp']
    },
    mkdir: {
      noop: {},
      simple: {
        options: {
          create: ['tmp']
        }
      },
      multiple: {
        options: {
          create: ['tmp/a', 'tmp/b']
        }
      },
      deep: {
        options: {
          create: ['tmp/c/d']
        }
      },
      mode: {
        options: {
          mode: 0700,
          create: ['tmp/e']
        }
      }
    },
    watch: {
      all: {
        files: ['src/**.coffee', 'test/**.coffee'],
        tasks: ['test']
      }
    },
    mochacli: {
      options: {
        files: 'test/*_test.coffee',
        compilers: ['coffee:coffee-script']
      },
      spec: {
        options: {
          reporter: 'spec'
        }
      }
    }
  });

  this.loadNpmTasks('grunt-contrib-clean');
  this.loadNpmTasks('grunt-contrib-coffee');
  this.loadNpmTasks('grunt-contrib-watch');
  this.loadNpmTasks('grunt-mocha-cli');
  this.loadTasks('tasks');

  this.registerTask('npmPack', 'Create NPM package.', function() {
    var done;
    done = this.async();
    return grunt.util.spawn({
      cmd: 'npm',
      args: ['pack']
    }, function(error, result, code) {
      if (result.stderr) {
        grunt.log.writeln(result.stderr);
      }
      if (result.stdout) {
        grunt.log.writeln(result.stdout);
      }
      return done(!error);
    });
  });

  this.registerTask('default', ['test']);
  this.registerTask('build', ['clean', 'coffee']);
  this.registerTask('package', ['clean', 'coffee', 'npmPack']);

  return this.registerTask('test', ['build', 'mkdir', 'mochacli']);
};

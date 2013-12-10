module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/* <%= pkg.description %>, v<%= pkg.version %> <%= pkg.homepage %>\n' +
        'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>, MIT license ' +
        '<%= pkg.licenses[0].url %> */'
    },

    // run jshint on the files, with the options described below. Different globals defined based on file type
    // 'node' for files that are run by node.js (module, process, etc.)
    // 'browser' for files that are run by a browser (window, document, etc.)
    lint: {
      node: ['grunt.js', 'test/generate_expected.phantom.js'],
      browser: ['postscribe.js']
    },
    jshint: {
      // Apply to all js files
      options: {
        curly: true,
        eqeqeq: true,
        expr: true,
        forin: true,
        indent: 2,
        latedef: false,
        newcap: true,
        noarg: true,
        noempty: true,
        white: false,
        // debatable
        sub: true,
        undef: true,
        // Really. Leave it
        unused: true
      },
      globals: {},
      // Just for the 'node' src files
      node: {
        globals: {
          console: true,
          process: true,
          module: true,
          require: true,
          __dirname: true,
          exports: true
        }
      },
      // Just for the 'browser' src files
      browser: {
        // Let's be very strict here
        options: {
          loopfunc: true,
          expr: true,
          evil: true,
          // Reluctantly added
          eqnull: true
        },
        globals: {}
      }
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', 'htmlParser/htmlParser.js', 'postscribe.js'],
        dest: 'dist/postscribe.js'
      }
    },
    // Minify postscribe src to postscribe.min.js, prepending a banner
    min: {
      dist: {
        src: ['<banner:meta.banner>', 'dist/postscribe.js'],
        dest: 'dist/postscribe.min.js'
      }
    },

    qunit: {
      files: ['test/test.html']
    },

    watch: {
      files: ['postscribe.js', 'test/*'],
      tasks: 'lint qunit'
    },

    generate_expected: {
      index: "<config:qunit.files>",
      dest: "test/expected.js",
      phantom: "test/generate_expected.phantom.js"
    }

  });

  grunt.registerTask('generate_expected', "Generate Files", function() {
    var done = this.async();

    var data = grunt.config('generate_expected');
    var args = [data.phantom, data.index, data.dest];
    console.log(args);

    grunt.utils.spawn({cmd: 'phantomjs', args: args}, function(error, result) {
      if(error) {
        console.error(result.stderr);
      }
      done(!error);
    });
  });

  // Alias test
  grunt.registerTask('test', 'generate_expected qunit');

  // This is what gets run when you don't specify an argument for grunt.
  grunt.registerTask('default', 'lint test');

};

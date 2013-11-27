module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    env : {
      options: {
        add: {
          globalOption : 'foo'
        },
        replace: {
          USER: 'horst'
        },
        extend: {
          PATH: {
            value: 'node_modules/.bin',
            delimiter: ':'
          },
          HOME: {
            value: 'WHATEVER'
          }
        }
      },
      testData : {
        data : 'bar'
      },
      testOptions : {
        options : {
          localOption : 'baz',
          USER: 'fritz'
        }
      },
      testDotEnv : {
        src : ['.env', '.env.json']
      }
    },
    clean : {
      env : ['.env*']
    },
    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      task : ['tasks/**/*.js']
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  var assert = require('assert');

  grunt.registerTask('testData', function(){
    assert.equal(process.env.globalOption, 'foo', 'globalOption should be set');
    assert.equal(process.env.data, 'bar', 'data should be set');
    assert.equal(process.env.USER, 'horst', 'USER should be set to "horst"');
    assert(process.env.PATH.indexOf('node_modules/.bin') >= 0, 'PATH should contain "node_modules/.bin"');
    assert(process.env.PATH.indexOf('node_modules/.bin:') >= 0, 'PATH should contain "node_modules/.bin:"');
    assert(process.env.HOME.indexOf('WHATEVER') >= 0, 'HOME should contain "WHATEVER"');
    assert(process.env.HOME.indexOf('WHATEVER') >= 7, 'HOME should start with "/home/" and end in "WHATEVER"');
    assert(process.env.HOME.indexOf('/home/') === 0, 'HOME should start with "/home/" and end in "WHATEVER"');
    assert(process.env.HOME.indexOf('WHATEVER') === process.env.HOME.length - 8, 'HOME should start with "/home/" and end in "WHATEVER"');
    delete process.env.globalOption;
    delete process.env.data;
  });

  grunt.registerTask('testOptions', function(){
    assert.equal(process.env.globalOption, 'foo', 'globalOption should be set');
    assert.equal(process.env.localOption, 'baz', 'localOption should be set');
    assert.equal(process.env.USER, 'fritz', 'USER should be set to "fritz"');
    assert(process.env.PATH.indexOf('node_modules/.bin') >= 0, 'PATH should contain "node_modules/.bin"');
    assert(process.env.PATH.indexOf('node_modules/.bin:') >= 0, 'PATH should contain "node_modules/.bin:"');
    assert(process.env.HOME.indexOf('WHATEVER') >= 0, 'HOME should contain "WHATEVER"');
    assert(process.env.HOME.indexOf('WHATEVER') >= 7, 'HOME should start with "/home/" and end in "WHATEVER"');
    assert(process.env.HOME.indexOf('/home/') === 0, 'HOME should start with "/home/" and end in "WHATEVER"');
    assert(process.env.HOME.lastIndexOf('WHATEVER') === process.env.HOME.length - 8, 'HOME should start with "/home/" and end in "WHATEVER"');
    assert(process.env.HOME.indexOf('WHATEVER') === process.env.HOME.length - 16, 'HOME should start with "/home/" and end in "WHATEVER"');
    assert(process.env.HOME.indexOf('WHATEVERWHATEVER') === process.env.HOME.length - 16, 'HOME should start with "/home/" and end in "WHATEVERWHATEVER"');
    delete process.env.globalOption;
    delete process.env.localOption;
  });

  grunt.registerTask('writeDotEnv', function(){
    grunt.file.write('.env', "dotEnvFileData=bar\ndotEnvFileOption=baz\nUSER=horst");
    grunt.file.write('.env.json', '{"jsonValue" : "foo","extend" : {"PATH":"jsonPath"}}');
  });

  grunt.registerTask('testDotEnv', function(){
    assert(!process.env.src, 'Should not include src');
    assert.equal(process.env.jsonValue, 'foo', 'value from json env file should be set');
    assert(process.env.PATH.indexOf('jsonPath') >= 0, 'PATH should contain "jsonPath"');
    assert.equal(process.env.dotEnvFileData, 'bar', 'dotEnvFileData should be set');
    assert.equal(process.env.USER, 'horst', 'USER should be set to "horst"');
    assert.equal(process.env.dotEnvFileOption, 'baz', 'dotEnvFileOption should be set');
    delete process.env.jsonValue;
    delete process.env.dotEnvFileData;
    delete process.env.dotEnvFileOption;
  });

  // Default task.
  grunt.registerTask('default', [
    'clean',
    'jshint',
    'env:testData',
    'testData',
    'env:testOptions',
    'testOptions',
    'writeDotEnv',
    'env:testDotEnv',
    'testDotEnv',
    'clean'
  ]);

};

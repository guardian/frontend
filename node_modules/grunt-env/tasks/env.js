/*
 * grunt-env
 * https://github.com/onehealth/grunt-env
 *
 * Copyright (c) 2012 OneHealth Solutions, inc
 * Licensed under the Apache 2.0 license.
 */

"use strict";
var ini = require('ini');

module.exports = function (grunt) {

  grunt.registerMultiTask('env', 'Specify an ENV configuration for future tasks in the chain', function() {

    extendEnv(this.options());
    var data = grunt.util._.clone(this.data);
    delete data.src;
    extendEnv(data);

    if (this.files.length) {
      this.files[0].src.forEach(function(file){
        var fileContent = grunt.file.read(file);
        var data = readJson(fileContent) || readIni(fileContent) || {};
        extendEnv(data);
      });
    }
  });

  function extendEnv(options) {
    grunt.util._.forEach(options, function(optionData, option) {
      if(option === 'add' && typeof optionData === 'object') {
        grunt.util._.forEach(optionData, function(value, key) {
          if(process.env[key]) {
            grunt.log.writeln('Not adding "' + key + '", because it already exists. Maybe you wanted to put it under the "replace" or "extend" options?');
          } else {
            var data = {};
            data[key] = value;
            grunt.util._.extend(process.env, data);
          }
        });
      } else if(option === 'replace' && typeof optionData === 'object') {
        grunt.util._.forEach(optionData, function(value, key) {
          if(process.env[key]) {
            process.env[key] = value;
          } else {
            grunt.log.writeln('Not replacing "' + key + '", because it doesn\'t exist. Maybe you wanted to put it under the "add" options?');
          }
        });
      } else if(option === 'extend' && typeof optionData === 'object') {
        grunt.util._.forEach(optionData, function(value, key) {
          if(process.env[key]) {
            if(typeof value === 'object') {
              if(value.delimiter) {
                var array = process.env[key].split(value.delimiter);
                array.unshift(value.value);
                process.env[key] = array.join(value.delimiter);
              } else {
                process.env[key] += value.value;
              }
            } else {
              process.env[key] += value;
            }
          } else {
            grunt.log.writeln('Not extending "' + key + '", because it doesn\'t exist. Maybe you wanted to put it under the "add" options?');
          }
        });
      } else {
        var data = {};
        data[option] = optionData;
        grunt.util._.extend(process.env, data);
      }
    });
  }
};

function readJson(content) {
  try {
    return JSON.parse(content);
  } catch(e) {
    return;
  }
}

function readIni(content) {
  try {
    return ini.parse(content);
  } catch(e) {
    return;
  }
}


/*
 * grunt-hash
 * https://github.com/jgallen23/grunt-hash
 *
 * Copyright (c) 2012 Greg Allen
 * Licensed under the MIT license.
 */

function unixify(path) {
  return path.split('\\').join('/');
}

module.exports = function(grunt) {
  var path = require('path');
  var getHash = require('../lib/hash');

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('hash', 'Append a unique hash to tne end of a file for cache busting.', function() {
    var options = this.options({
      srcBasePath: "",
      destBasePath: "",
      flatten: false,
      hashLength: 8
    });
    var map = {};
    var mappingExt = path.extname(options.mapping);

    // If mapping file is a .json, read it and just override current modifications
    if (mappingExt === '.json' && grunt.file.exists(options.mapping)) {
      map = grunt.file.readJSON(options.mapping);
    }

    this.files.forEach(function(file) {
      file.src.forEach(function(src) {
        var source = grunt.file.read(src);
        var hash = getHash(source, 'utf8').substr(0, options.hashLength);
        var dirname = path.dirname(src);
        var rootDir = path.relative(options.srcBasePath, dirname);
        var ext = path.extname(src);
        var basename = path.basename(src, ext);

        // Default destination to the same directory
        var dest = file.dest || path.dirname(src);

        var newFile = basename + (hash ? '.' + hash : '') + ext;
        var outputPath = path.join(dest, newFile);

        // Determine if the key should be flatten or not. Also normalize the output path
        var key = path.join(rootDir, path.basename(src));
        var outKey = path.relative(options.destBasePath, outputPath);
        if (options.flatten) {
          key = path.basename(src);
          outKey = path.basename(outKey);
        }

        grunt.file.copy(src, outputPath);
        grunt.log.writeln('Generated: ' + outputPath);

        map[unixify(key)] = unixify(outKey);
      });
    });

    if (options.mapping) {
      var output = '';

      if (mappingExt === '.php') {
        output = "<?php return json_decode('" + JSON.stringify(map) + "'); ?>";
      } else {
        output = JSON.stringify(map, null, "  ");
      }

      grunt.file.write(options.mapping, output);
      grunt.log.writeln('Generated mapping: ' + options.mapping);
    }

  });



};

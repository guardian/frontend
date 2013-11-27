/*
 * grunt-css-metrics
 * https://github.com/phamann/grunt-css-metrics
 *
 * Copyright (c) 2013 Patrick Hamann, contributors
 * Licensed under the MIT license.
 */
'use strict';
var CSSMetrics = require('../lib/cssmetrics'),
    glob = require('glob');

module.exports = function (grunt) {

    grunt.registerMultiTask('cssmetrics', 'Analyse CSS metrics', function () {

        var done = this.async(),
            options = this.options({
                quiet: false
            });

        function analyseFiles(files) {
            grunt.util.async.forEachSeries(files, function(path, next) {

                if(!grunt.file.exists(path)) {
                    grunt.log.warn('Source file "' + path + '" not found.');
                    next();
                }

                new CSSMetrics(path).stats(function(stats) {

                    grunt.log.subhead('Metrics for ' + path);

                    grunt.log.ok(['Total rules: ' + stats.rules]);
                    grunt.log.ok(['Total selectors: ' + stats.totalSelectors]);
                    grunt.log.ok(['Average selectors per rule: ' + stats.averageSelectors]);
                    grunt.log.ok(['File size: ' + stats.fileSize]);
                    grunt.log.ok(['GZip size: ' + stats.gzipSize]);

                    if(!options.quiet && options.maxSelectors && (stats.totalSelectors > options.maxSelectors)) {
                        grunt.fail.warn(path + ' exceeded maximum selector count');
                    }

                    if(!options.quiet && options.maxFileSize && (stats.rawFileSize > options.maxFileSize)) {
                        grunt.fail.warn(path + ' exceeded maximum file size');
                    }

                    next();

                });
            }, function() {
                done();
            });
        }

        var filesToBeAnalysed = [];

        grunt.util.async.forEachSeries(this.data.src, function(f, next) {
            glob(f, options, function (er, files) {

                for (var j = 0; j < files.length; j++) {
                    if (filesToBeAnalysed.indexOf(files[j]) < 0) {
                        filesToBeAnalysed.push(files[j]);
                    }
                }

                next();
            });
        }, function () {
            analyseFiles(filesToBeAnalysed);
        });

    });

};

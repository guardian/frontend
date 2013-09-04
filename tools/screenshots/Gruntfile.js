/* global module: false */
module.exports = function (grunt) {
    var fs = require('fs'),
        screenshotDir = './screenshots',
        timestampDir = require('moment')().format('YYYY/MM/DD/HH:mm:ss/');

    // Project configuration.
    grunt.initConfig({
        casperjs: {
            options : {},
            screenshot: {
                src: ['./screenshot.js']
            }
        },
        s3: {
            options: {
                bucket: 'aws-frontend-store'
            },
            upload: {
                upload: fs.readdirSync(screenshotDir).map(function(screenshot) {
                    return {
                        src: screenshotDir + '/' + screenshot,
                        dest: 'DEV/screenshots/' + timestampDir + screenshot
                    };
                })
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-casperjs');
    grunt.loadNpmTasks('grunt-s3');

    // Create tasks
    grunt.registerTask('snap', ['casperjs:screenshot, s3:upload']);
};

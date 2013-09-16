/* global module: false */
module.exports = function (grunt) {
    var stage = grunt.option('stage') || 'dev',
        screenshotsDir = './screenshots',
        timestampDir = require('moment')().format('YYYY/MM/DD/HH:mm:ss/');

    // Project configuration.
    grunt.initConfig({
        clean: [screenshotsDir],
        mkdir: {
            screenshots: {
                create: [screenshotsDir]
            }
        },
        casperjs: {
            screenshot: {
                src: ['./screenshot.js']
            }
        },
        s3: {
            options: {
                bucket: 'aws-frontend-store',
		access:'public-read'
            },
            upload: {
                upload: [{
                    src: screenshotsDir + '/*.png',
                    dest: stage.toUpperCase() + '/screenshots/' + timestampDir
                }]
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-casperjs');
    grunt.loadNpmTasks('grunt-s3');

    // Create tasks
    grunt.registerTask('snap', ['clean', 'mkdir:screenshots', 'casperjs:screenshot', 's3:upload']);
};

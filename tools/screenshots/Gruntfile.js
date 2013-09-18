/* global module: false */
module.exports = function (grunt) {
    var env = grunt.option('env') || 'code',
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
        env: {
            casperjs: {
                ENVIRONMENT : env,
                PHANTOMJS_EXECUTABLE : "node_modules/casperjs/node_modules/.bin/phantomjs",
                extend: {
                    PATH: {
                        value: 'node_modules/.bin',
                        delimiter: ':'
                    }
                }
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
                    dest: env.toUpperCase() + '/screenshots/' + timestampDir
                }]
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-casperjs');
    grunt.loadNpmTasks('grunt-s3');
    grunt.loadNpmTasks('grunt-env');

    // Create tasks
    grunt.registerTask('snap', ['env:casperjs','clean', 'mkdir:screenshots', 'casperjs:screenshot', 's3:upload']);
};

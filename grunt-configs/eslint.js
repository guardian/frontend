'use strict';
module.exports = function(grunt, options) {
    return {
        self: [
            'Gruntfile.js'
        ],
        es6: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/es6',
                src: [
                    '**/*.js'
                ]
            }]
        },
        test: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/test',
                src: [
                    '**/*.js'
                ]
            }]
        },
        common: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/common',
                src: [
                    '**/*.js',
                    '!utils/atob.js'
                ]
            }]
        },
        facia: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/facia',
                src: [
                    '**/*.js'
                ]
            }]
        },
        'facia-tool': {
            files: [{
                expand: true,
                cwd: 'facia-tool/public/js/',
                src: [
                    '**/*.js',
                    '!jspm-config.js',
                    '!components/**/*.js'
                ]
            }]
        },
        membership: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/membership',
                src: [
                    '**/*.js'
                ]
            }]
        },
        bootstraps: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/bootstraps',
                src: [
                    '**/*.js'
                ]
            }]
        }
    };
};

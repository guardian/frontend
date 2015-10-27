module.exports = function(grunt, options) {
    return {
        options: {
            config: '.jscsrc'
        },
        es6: {
            options: {
                esnext: true,
                esprima: 'esprima-fb'
            },
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/es6',
                src: [
                    '**/*.js'
                ]
            }]
        },
        'es6-tests': {
            options: {
                esnext: true
            },
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/tests',
                src: [
                    '**/*.js',
                    '!components/**/*.js'
                ]
            }]
        },
        test: {
            options: {
                esnext: true
            },
            files: [{
                expand: true,
                cwd: 'static/test/javascripts',
                src: [
                    '**/*.js',
                    '!components/**/*.js'
                ]
            }]
        },
        common: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/common',
                src: [
                    '**/*.js',
                    '!modules/discussion/comment-box.js',
                    '!modules/discussion/comments.js',
                    '!modules/discussion/loader.js'
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

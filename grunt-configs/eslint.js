'use strict';
module.exports = function(grunt, options) {
    return {
        self: [
            'Gruntfile.js'
        ],
        'static/src': {
            files: [{
                expand: true,
                cwd: 'static/src',
                src: [
                    '**/*.js'
                ]
            }],
            options: {
                // https://github.com/eslint/eslint/issues/2824
                ignorePath: 'static/src/.eslintignore',
                quiet: true
            }
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
        }
    };
};

'use strict';
module.exports = function () {
    return {
        options: {
            rulePaths: ['./dev/eslint-rules']
        },
        'Gruntfile.js': [
            'Gruntfile.js'
        ],
        'grunt-configs': [
            'grunt-configs/**/*.js'
        ],
        'static/test/javascripts': {
            files: [{
                expand: true,
                cwd: 'static/test/javascripts',
                src: ['**/*.js']
            }],
            options: {
                ignorePath: 'static/test/javascripts/.eslintignore',
                quiet: true
            }
        },
        'static/src': {
            files: [{
                expand: true,
                cwd: 'static/src',
                src: ['**/*.js']
            }],
            options: {
                ignorePath: 'static/src/.eslintignore',
                quiet: true
            }
        }
    };
};

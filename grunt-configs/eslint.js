'use strict';
module.exports = function(grunt, options) {
    return {
        self: [
            'Gruntfile.js'
        ],
        all: {
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
        }
    };
};

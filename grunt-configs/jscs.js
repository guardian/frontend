module.exports = function () {
    return {
        // Folder specific config lives in here instead of `.jscsrc` because we
        // you can't currently extend `.jscsrc` files:
        // https://github.com/jscs-dev/node-jscs/issues/1106
        options: {
            config: '.jscsrc'
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
            }]
        },
        'static/src': {
            options: {
                // Because we can't extend, we assume the whole project is ES6
                esnext: true
            },
            files: [{
                expand: true,
                cwd: 'static/src',
                src: ['**/*.js']
            }]
        }
    };
};

module.exports = function () {
    return {
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
            files: [{
                expand: true,
                cwd: 'static/src',
                src: ['**/*.js']
            }]
        }
    };
};

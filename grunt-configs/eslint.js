module.exports = function(grunt, options) {
    return {
        options: {
            configFile: './static/src/javascripts/.eslintrc'
        },
        es6: {
            files: [{
                expand: true,
                cwd: './static/src/javascripts/es6',
                src: [
                    '**/*.js'
                ]
            }],
        }
    };
};

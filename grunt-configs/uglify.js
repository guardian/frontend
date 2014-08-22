module.exports = function(grunt, options) {
    return {
        javascript: {
            files: [{
                expand: true,
                cwd: options.staticTargetDir + 'javascripts',
                src: [
                    '{components,vendor}/**/*.js',
                    '!components/curl/**/*.js',
                    '!components/zxcvbn/**/*.js',
                    '!vendor/stripe/*.js'
                ],
                dest: options.staticTargetDir + 'javascripts'
            }]
        }
    };
};

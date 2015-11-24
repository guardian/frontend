module.exports = function (grunt, options) {
    var taskOptions = options.isDev
        ? {
            mangle: false,
            compress: false,
            beautify: true,
            preserveComments: true
        }
        : {};

    return {
        options: taskOptions,
        javascript: {
            files: [
                {
                    expand: true,
                    cwd: options.staticTargetDir + 'javascripts',
                    src: [
                        '{components,vendor}/**/*.js',
                        '!components/curl/**/*.js',
                        '!components/zxcvbn/**/*.js',
                        '!vendor/stripe/*.js'
                    ],
                    dest: options.staticTargetDir + 'javascripts'
                }
            ]
        },
        conf: {
            files: [{
                expand: true,
                cwd: 'static/public/javascripts/vendor',
                src: ['omniture.js'],
                dest: 'common/conf/assets/vendor'
            }],
            options: options.isDev ? {} : {
                // Set to false retain constant expressions, used to avoid writing HTML like </script>.
                compress: false
            }
        }
    };
};

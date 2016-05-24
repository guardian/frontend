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
                        'es5-html5.js',
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
                cwd: 'static/public/javascripts',
                src: [
                    'vendor/omniture.js'
                ],
                dest: 'common/conf/assets'
            },
            {
                expand: true,
                cwd: 'static/src/javascripts/',
                src: [
                    'projects/common/modules/analytics/analytics.js'
                ],
                dest: 'common/conf/assets'
            }
            ],
            options: options.isDev ? {} : {
                compress: {
                    // Set to false retain constant expressions, used to avoid writing HTML like </script>.
                    evaluate: false
                }
            }
        }
    };
};

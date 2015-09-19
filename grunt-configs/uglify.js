module.exports = function (grunt, options) {
    return {
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
                cwd: 'static/src/jspm_packages',
                src: [
                    'system.src.js',
                    'system-polyfills.src.js'
                ],
                dest: 'common/conf/assets'
            }, {
                expand: true,
                cwd: 'static/src',
                src: ['systemjs-normalize.js',
                      'systemjs-config.js'],
                dest: 'common/conf/assets'
            }, {
                expand: true,
                cwd: 'static/public/javascripts/vendor',
                src: ['omniture.js'],
                dest: 'common/conf/assets/vendor'
            }],
            options:   {
                compress: {
                    evaluate: false // Set to false retain constant expressions, used to avoid writing HTML like </script>.
                }
            }
        }
    };
};

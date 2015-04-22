module.exports = function(grunt, options) {
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
            files:[
            {
                expand: true,
                cwd: 'static/src/jspm_packages',
                src: [
                    'system.src.js',
                    'es6-module-loader.src.js',
                ],
                dest: 'common/conf/assets'
            }],
            options:   {
                compress:{
                    evaluate: false
                }
            }
        }
    };
};

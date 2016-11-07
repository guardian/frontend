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
                        'es5-html5.js'
                    ],
                    dest: options.staticTargetDir + 'javascripts'
                }
            ]

        }
    };
};

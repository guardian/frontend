module.exports = function (grunt, options) {
    return {
        app: {
            // Input source maps are broken in this task
            // https://github.com/gruntjs/grunt-contrib-concat/issues/131
            // options: { sourceMap: true },
            src: [
                options.staticSrcDir + 'javascripts/components/curl/curl-domReady.js',
                options.requirejsDir + '/boot.js'
            ],
            dest: options.staticTargetDir + 'javascripts/app.js'
        }
    };
};

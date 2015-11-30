module.exports = function (grunt, options) {
    return {
        standard: {
            // https://github.com/gruntjs/grunt-contrib-concat/issues/131
            // options: { sourceMap: true },
            src: [
                options.staticSrcDir + 'javascripts/components/curl/curl-domReady.js',
                options.requirejsDir + '/bootstraps/standard.js',
                options.staticSrcDir + 'javascripts/boot.js'
            ],
            dest: options.staticTargetDir + 'javascripts/standard.js'
        }
    };
};

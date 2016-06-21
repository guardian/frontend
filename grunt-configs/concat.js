module.exports = function (grunt, options) {
    return {
        app: {
            // Input source maps are broken in this task
            // https://github.com/gruntjs/grunt-contrib-concat/issues/131
            // options: { sourceMap: true },
            src: [
                'node_modules/curl-amd/dist/curl-with-js-and-domReady/curl.js',
                options.staticTargetDir + 'javascripts/boot.js'
            ],
            dest: options.staticTargetDir + 'javascripts/app.js'
        },

        shivsAndShims: {
            src: [
                'node_modules/es5-shim/es5-shim.min.js',
                'node_modules/html5shiv/dist/html5shiv.min.js'
            ],
            dest: options.staticTargetDir + 'javascripts/vendor/es5-html5.js'
        }
    };
};

module.exports = function (grunt, options) {
    return {
        app: {
            // Input source maps are broken in this task
            // https://github.com/gruntjs/grunt-contrib-concat/issues/131
            // options: { sourceMap: true },
            src: [
                options.staticPublic + 'javascripts/vendor/omniture.js',
                options.staticSrcDir + 'javascripts/bootstraps/standard/omniture-pageview.js',
                options.staticSrcDir + 'javascripts/components/curl/curl-domReady.js',
                options.requirejsDir + '/boot.js'
            ],
            dest: options.staticTargetDir + 'javascripts/app.js',
            options: {
                process: function (src, path) {
                    // make sure omniture handles an error
                    // behaviour is duplicated in /common/app/views/fragments/omnitureScript.scala.html
                    if (path.match(/vendor\/omniture\.js/)) {
                        src = "try { \n" + src + "\n} catch (e) {(new Image()).src = window.guardian.config.page.beaconUrl + '/count/omniture-library-error.gif';}"
                    }
                    return src;
                },
                separator: ';\n'
            }
        }
    };
};

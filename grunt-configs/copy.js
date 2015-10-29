module.exports = function (grunt, options) {
    return {
        'javascript': {
            files: [
                {
                    expand: true,
                    cwd: 'static/public/javascripts/components',
                    src: ['**/*.js'],
                    dest: options.staticTargetDir + 'javascripts/components'
                },
                {
                    expand: true,
                    cwd: 'static/public/javascripts/vendor',
                    src: ['**/*.js'],
                    dest: options.staticTargetDir + 'javascripts/vendor'
                },
                {
                    expand: true,
                    cwd: 'static/src/javascripts/vendor',
                    src: [
                        'formstack-interactive/0.1/boot.js',
                        'vast-client.js',
                        'stripe/stripe.min.js'
                    ],
                    dest: options.staticTargetDir + 'javascripts/vendor'
                },
                {
                    expand: true,
                    cwd: 'static/src/javascripts/vendor',
                    src: [
                        '**/*'
                    ],
                    dest: options.staticHashDir + 'javascripts/vendor'
                },
                (options.isDev ? {
                    expand: true,
                    cwd: options.staticSrcDir + 'javascripts',
                    src: [
                        'bootstraps/**/*.js'
                    ],
                    dest: options.staticTargetDir + 'javascripts'
                } : {
                    expand: true,
                    cwd: options.requirejsDir,
                    src: [
                        'core.js',
                        'core.js.map',
                        'bootstraps/app.js',
                        'bootstraps/app.js.map',
                        'bootstraps/commercial.js',
                        'bootstraps/commercial.js.map',
                        'components/curl/curl-domReady.js'
                    ],
                    dest: options.staticTargetDir + 'javascripts'
                })
            ]
        },
        css: {
            files: [{
                expand: true,
                cwd: 'static/src/stylesheets',
                src: ['**/*.scss'],
                dest: options.staticTargetDir + 'stylesheets'
            }]
        },
        images: {
            files: [{
                expand: true,
                cwd: 'static/public/images',
                src: ['**/*'],
                dest: options.staticTargetDir + 'images'
            }]
        },
        flash: {
            files: [{
                expand: true,
                cwd: 'static/public/flash',
                src: ['**/*.swf'],
                dest: options.staticTargetDir + 'flash'
            }]
        },
        inlineCss: {
            files: [{
                expand: true,
                cwd: options.staticTargetDir + 'stylesheets',
                src: ['**/head*.css', 'inline/**/*.css'],
                flatten: true,
                dest: 'common/conf/assets/inline-stylesheets'
            }]
        },
        headJs: {
            files: [
                {
                    expand: true,
                    cwd: 'static/src/javascripts/components/curl',
                    src: ['curl-domReady.js'],
                    dest: 'common/conf/assets'
                }
            ]
        },
        // asset maps must go where Play can find it from resources at runtime.
        // Everything else goes into frontend-static bundling.
        assetMaps: {
            files: [{
                expand: true,
                cwd: options.staticHashDir + 'assets',
                src: ['**/assets.map'],
                dest: 'common/conf/assets'
            }]
        },
        inlineSVGs: {
            files: [{
                expand: true,
                cwd: 'static/src/inline-svgs',
                src: ['**/*.svg'],
                dest: 'common/conf/assets/inline-svgs'
            }]
        },
        /**
         * NOTE: not using this as doesn't preserve file permissions (using shell:copyHooks instead)
         * Waiting for Grunt 0.4.3 - https://github.com/gruntjs/grunt/issues/615
         */
        hooks: {
            files: [{
                expand: true,
                cwd: 'git-hooks',
                src: ['*'],
                dest: '.git/hooks/'
            }]
        }
    };
};

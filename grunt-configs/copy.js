module.exports = function (grunt, options) {
    return {
        'javascript': {
            files: [
                {
                    expand: true,
                    cwd: 'static/public/javascripts',
                    src: ['**/*.js'],
                    dest: options.staticTargetDir + 'javascripts'
                },
                {
                    expand: true,
                    cwd: 'static/src/javascripts/vendor',
                    src: [
                        'formstack-interactive/**/*',
                        'prebid/**/*',
                        'stripe/**/*'
                    ],
                    dest: options.staticTargetDir + 'javascripts/vendor'
                },
                {
                    expand: true,
                    cwd: 'static/src/javascripts/vendor',
                    src: [
                        'foresee/**/*'
                    ],
                    dest: options.staticHashDir + 'javascripts/vendor'
                }
            ]
        },
        images: {
            files: [{
                expand: true,
                cwd: 'static/public/images',
                src: ['**/*'],
                dest: options.staticTargetDir + 'images'
            }]
        },
        inlineCss: {
            files: [{
                expand: true,
                cwd: options.staticTargetDir + 'stylesheets',
                src: ['atomic.css', '**/head*.css', 'inline/**/*.css'],
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

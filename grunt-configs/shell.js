module.exports = function(grunt, options) {
    var jspm = './node_modules/.bin/jspm';

    return {
        spriteGeneration: {
            command: 'find . -name \'*.json\' -exec node spricon.js {} \\;',
            options: {
                execOptions: {
                    cwd: 'tools/sprites'
                }
            }
        },
        /**
         * Using this task to copy hooks, as Grunt's own copy task doesn't preserve permissions
         */
        copyHooks: {
            command: 'ln -s ../git-hooks .git/hooks',
            options: {
                failOnError: false
            }
        },

        abTestInfo: {
            command: 'node tools/ab-test-info/ab-test-info.js ' +
                     'static/src/javascripts/projects/common/modules/experiments/tests ' +
                     'static/abtests.json'
        },

        jspmInstallFaciaTool: {
            command: '../../' + jspm + ' install',
            options: {
                execOptions: {
                    cwd: 'facia-tool/public'
                }
            }
        },

        jspmInstallStatic: {
            command: jspm + ' install',
            options: {
                execOptions: {
                    cwd: '.'
                }
            }
        },

        jspmBundleStatic: {
            command: jspm + ' bundle-sfx es6/bootstraps/app static/target/bundles/app.js',
            options: {
                execOptions: {
                    cwd: '.'
                }
            }
        },

        jspmBundleFaciaToolCollections: {
            command: '../../' + jspm + ' bundle --minify ' + [
                'models/collections/loader',
                'widgets/fronts',
                'widgets/latest',
                'widgets/clipboard',
                'widgets/fronts.html!text',
                'widgets/latest.html!text',
                'widgets/search_controls.html!text',
                'widgets/collection.html!text',
                'widgets/clipboard.html!text'
            ].join(' + ') + ' js/build/collections.js',
            options: {
                execOptions: {
                    cwd: 'facia-tool/public'
                }
            }
        },

        jspmBundleFaciaToolConfig: {
            command: '../../' + jspm + ' bundle --minify ' + [
                'models/config/loader'
            ].join(' + ') + ' js/build/config.js',
            options: {
                execOptions: {
                    cwd: 'facia-tool/public'
                }
            }
        }
    };
};

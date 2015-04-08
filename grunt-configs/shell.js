module.exports = function(grunt, options) {
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
            command: 'node ../../node_modules/jspm/jspm.js install',
            options: {
                execOptions: {
                    cwd: 'facia-tool/public'
                }
            }
        },

        jspmInstallStatic: {
            command: './node_modules/.bin/jspm install',
            options: {
                execOptions: {
                    cwd: '.'
                }
            }
        },

        jspmBundleStatic: {
            command: './node_modules/.bin/jspm bundle-sfx es6/bootstraps/app static/target/bundles/app.js',
            options: {
                execOptions: {
                    cwd: '.'
                }
            }
        }
    };
};

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
            command:
                './node_modules/.bin/jspm bundle core static/target/bundles/core.js && ' +
                // './node_modules/.bin/jspm bundle es6/bootstraps/app - core static/target/bundles/app.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/app - core static/target/bundles/app.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/commercial - core static/target/bundles/commercial.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/sudoku - core static/target/bundles/sudoku.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/image-content - core static/target/bundles/image-content.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/facia - core static/target/bundles/facia.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/football - core static/target/bundles/football.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/preferences - core static/target/bundles/preferences.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/membership - core static/target/bundles/membership.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/ophan - core static/target/bundles/ophan.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/admin - core static/target/bundles/admin.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/video-player - core static/target/bundles/video-player.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/video-embed - core static/target/bundles/video-embed.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/dev - core static/target/bundles/dev.js && ' +
                './node_modules/.bin/jspm bundle bootstraps/creatives - core static/target/bundles/creatives.js'
            ,
            options: {
                execOptions: {
                    cwd: '.'
                }
            }
        }
    };
};

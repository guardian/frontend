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
                     'static/src/javascripts/modules/experiments/tests ' +
                     'static/abtests.json'
        },

        jspmFaciaTool: {
            command: 'jspm install',
            options: {
                execOptions: {
                    cwd: 'facia-tool/public'
                }
            }
        }
    };
};

module.exports = function () {
    return {
        spriteGeneration: {
            command: 'node spricon',
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

        install: {
            command: 'make install'
        },

        updateCanIUse: {
            command: 'npm update caniuse-db'
        },

        eslintTests: {
            command: 'node dev/eslint-rules/tests/*'
        },

        makeDeploysRadiator: {
            command: 'npm run compile-deploy-radiator'
        },

        atomiseCSS: {
            command: 'make atomise-css'
        }
    };
};

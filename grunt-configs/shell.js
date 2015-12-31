module.exports = function () {
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

        install: {
            command: 'make install'
        },

        updateCanIUse: {
            command: 'npm update caniuse-db'
        },

        eslintTests: {
            command: 'node dev/eslint-rules/tests/*'
        },

        stubAppJs: {
            command: 'touch static/target/javascripts/app.js'
        },

        makeDeploysRadiator: {
            command: [
                'npm install',
                './node_modules/.bin/jspm install',
                './node_modules/.bin/tsd install',
                'npm run build',
                'cp -r ./target ../../target/deploys-radiator'
            ].join(' && '),
            options: {
                execOptions: {
                    cwd: 'static/src/deploys-radiator'
                }
            }
        }
    };
};

module.exports = function(grunt, options) {
    return {
        spriteGeneration: {
            command: [
                'cd tools/sprites/',
                'find . -name \'*.json\' -exec node spricon.js {} \\;'
            ].join('&&'),
            options: {
                stdout: true,
                stderr: true,
                failOnError: true
            }
        },
        /**
         * Using this task to copy hooks, as Grunt's own copy task doesn't preserve permissions
         */
        copyHooks: {
            command: 'ln -s ../git-hooks .git/hooks',
            options: {
                stdout: true,
                stderr: true,
                failOnError: false
            }
        },

        abTestInfo: {
            command: 'node tools/ab-test-info/ab-test-info.js ' +
                     'common/app/assets/javascripts/modules/experiments/tests ' +
                     'static/abtests.json',
            options: {
                stdout: true,
                stderr: true,
                failOnError: true
            }
        }
    };
};

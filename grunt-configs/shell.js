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

        cssBenchmark: {
            command: [
                'npm install',
                'node bin/bench --html --only clean,csso,cssshrink,csswring,sqwish,ycssmin --verbose --gzip --total'
                // basically exclude condense, more-css and ncss because they error out
            ].join('&&'),
            options: {
                execOptions: {
                    cwd: 'node_modules/css-minification-benchmark'
                },
                stdout: false,
                callback: function (err, stdout, stderr, cb) {
                    require('fs').writeFile('tmp/css-benchmark.html', stdout.substring(stdout.indexOf('<!DOCTYPE')), cb);
                }
            }
        }
    };
};

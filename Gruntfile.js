'use strict';
/* global module: false, process: false */

var task = process.argv[2];
if (task !== 'install') {
    var dependencyTest = require('check-dependencies').sync();

    if (dependencyTest.status !== 0) {
        console.error(dependencyTest.error.join('\n')); // eslint-disable-line no-console
        process.exit(dependencyTest.status);
    }
}

module.exports = function (grunt) {

    require('time-grunt')(grunt);

    var options = {
        isDev: (grunt.option('dev') !== undefined) ? Boolean(grunt.option('dev')) : process.env.GRUNT_ISDEV === '1',
        singleRun:       grunt.option('single-run') !== false,
        staticTargetDir: './static/target/',
        staticPublicDir: './static/public/',
        staticSrcDir:    './static/src/',
        staticHashDir:   './static/hash/',
        testConfDir:     './static/test/javascripts/conf/',
        requirejsDir:    './static/requirejs',
        webfontsDir:     './static/src/fonts/'
    };

    options.propertiesFile = options.isDev ?
        process.env.HOME + '/.gu/frontend.properties' : '/etc/gu/frontend.properties';

    // Load config and plugins (using jit-grunt)
    require('load-grunt-config')(grunt, {
        configPath: require('path').join(process.cwd(), 'grunt-configs'),
        data: options,
        jitGrunt: {
            staticMappings: {
                replace: 'grunt-text-replace',
                sasslint: 'grunt-sass-lint',
                cssmetrics: 'grunt-css-metrics',
                assetmonitor: 'grunt-asset-monitor',
                /*eslint-disable camelcase*/
                px_to_rem: 'grunt-px-to-rem',
                frequency_graph: 'grunt-frequency-graph'
                /*eslint-enable camelcase*/
            }
        }
    });

    if (options.isDev) {
        grunt.log.subhead('Running Grunt in DEV mode');
    }

    /**
     * Analyse tasks
     */
    grunt.registerTask('analyse:css', ['compile:css', 'cssmetrics:common']);
    grunt.registerTask('analyse:js', ['compile:js', 'bytesize:js']);
    grunt.registerTask('analyse:performance', function (app) {
        var target = app ? ':' + app : '';
        grunt.task.run('pagespeed' + target);
    });
    grunt.registerTask('analyse', ['analyse:css', 'analyse:js', 'analyse:performance']);

    /**
     * Miscellaneous tasks
     */
    grunt.registerTask('hookmeup', ['clean:hooks', 'shell:copyHooks']);
    grunt.registerTask('emitAbTestInfo', 'shell:abTestInfo');

};

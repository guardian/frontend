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

    // Default task - used by grunt-tc
    grunt.registerTask('default', function () {
        grunt.task.run(['shell:install', 'clean', 'validate', 'compile-assets', 'test', 'analyse']);
    });

    /**
     * Deprecated/retired tasks
     */
    grunt.registerTask('compile', function () {
        require('megalog').error('`grunt compile` has been removed.\n\nUse `make compile` or `make compile-dev` instead.\n\nIf you’re developing, you might want to use `make watch`. Run `make` for more details.');
    });

    grunt.registerTask('install', function () {
        require('megalog').error('`grunt install` has been removed.\n\nUse `make install` instead.');
    });

    grunt.registerTask('prepare', function () {
        require('megalog').error('`grunt prepare` has been removed.\n\nUse `make install` instead… ');
    });

    grunt.registerTask('watch', function () {
        require('megalog').error('`grunt watch` has been removed.\n\nUse `make watch` instead… ');
    });

    grunt.registerTask('csdevmode', function () {
        require('megalog').error('`grunt csdevmode` has been removed.\n\nUse `make watch` instead… ');
    });

    /**
     * Validate tasks
     */
    grunt.registerTask('validate:css', ['compile:images', 'sass:compile']);
    grunt.registerTask('validate:sass', ['sasslint']);
    grunt.registerTask('validate:js', function (app) {
        var target = (app) ? ':' + app : '';
        grunt.task.run(['eslint' + target]);
    });
    grunt.registerTask('validate', function (app) {
        grunt.task.run(['validate:css', 'validate:sass', 'validate:js:' + (app || '')]);
    });

    /**
     * Compile tasks
     */
    grunt.registerTask('sass:compile', ['concurrent:sass']);

    grunt.registerTask('compile:images', ['copy:images', 'shell:spriteGeneration']);
    grunt.registerTask('compile:css', function () {
        grunt.task.run(['clean:css', 'mkdir:css', 'compile:images', 'sass:compile']);

        if (!options.isDev) {
            grunt.task.run(['shell:updateCanIUse']);
        }

        grunt.task.run(['px_to_rem', 'autoprefixer']);
    });
    grunt.registerTask('compile:js', function () {
        grunt.task.run(['clean:js', 'compile:inlineSvgs']);

        grunt.task.run(['concurrent:requireJS', 'copy:javascript', 'concat:app', 'uglify:javascript']);
    });
    grunt.registerTask('develop:js', function () {
        grunt.task.run(['copy:inlineSVGs', 'clean:js', 'copy:javascript']);
    });
    grunt.registerTask('compile:fonts', ['mkdir:fontsTarget', 'webfontjson']);
    grunt.registerTask('compile:flash', ['copy:flash']);
    grunt.registerTask('compile:inlineSvgs', ['copy:inlineSVGs', 'svgmin:inlineSVGs']);
    grunt.registerTask('compile:conf', ['copy:headJs', 'copy:inlineCss', 'copy:assetMaps', 'compile:inlineSvgs', 'uglify:conf']);
    var identity = function (x) { return x; };
    grunt.registerTask('compile-assets', [
        'compile:css',
        (options.isDev ? 'develop:js' : 'compile:js'),
        'compile:fonts',
        'compile:flash',
        !options.isDev && 'makeDeploysRadiator',
        !options.isDev && 'asset_hash',
        'compile:conf'
    ].filter(identity));

    /**
     * compile:js:<requiretask> tasks. Generate one for each require task
     */
    function compileSpecificJs(requirejsName) {
        if (!options.isDev && requirejsName !== 'common') {
            grunt.task.run('requirejs:common');
        }
        grunt.task.run(['requirejs:' + requirejsName, 'copy:javascript', 'concat:app', 'uglify:javascript', 'asset_hash']);
    }
    for (var requireTaskName in grunt.config('requirejs')) {
        if (requireTaskName !== 'options') {
            grunt.registerTask('compile:js:' + requireTaskName, compileSpecificJs.bind(this, requireTaskName));
        }
    }

    /**
     * Test tasks
     */
    grunt.registerTask('eslintTests', ['shell:eslintTests']);
    grunt.registerTask('test:unit', function (app) {
        var target = app ? ':' + app : '';
        if (options.singleRun === false) {
            grunt.config.set('karma.options.singleRun', false);
            grunt.config.set('karma.options.autoWatch', true);
        }

        grunt.task.run(['copy:inlineSVGs']);
        grunt.task.run('karma' + target);
        grunt.task.run('eslintTests');
    });
    grunt.registerTask('test', ['test:unit']);
    grunt.registerTask('coverage', function () {
        var target = this.args.length ? ':' + this.args.join(':') : '';
        grunt.config.set('karma.options.reporters',
            grunt.config.get('karma.options.reporters').concat('coverage')
        );
        grunt.config.set('karma.options.preprocessors',
            grunt.config.get('coverage.preprocessors')
        );
        grunt.task.run('test' + target);
    });

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
    grunt.registerTask('makeDeploysRadiator', 'shell:makeDeploysRadiator');

};

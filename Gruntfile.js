/* global module: false, process: false */

module.exports = function (grunt) {

    require('time-grunt')(grunt);

    var options = {
        isDev: (grunt.option('dev') !== undefined) ?
            Boolean(grunt.option('dev')) :
            process.env.GRUNT_ISDEV === '1',
        singleRun: grunt.option('single-run') !== false,
        staticTargetDir: './static/target/',
        staticHashDir: './static/hash/',
        testConfDir: './common/test/assets/javascripts/conf/',
        requirejsDir: './static/requirejs',
        webfontsDir: './resources/fonts/'
    };

    options.propertiesFile = options.isDev ?
        process.env.HOME + '/.gu/frontend.properties' :
        '/etc/gu/frontend.properties';

    // Load config and plugins (using jit-grunt)
    require('load-grunt-config')(grunt, {
        configPath: require('path').join(process.cwd(), 'grunt-configs'),
        data: options,
        jitGrunt: {
            replace: 'grunt-text-replace',
            scsslint: 'grunt-scss-lint',
            cssmetrics: 'grunt-css-metrics',
            assetmonitor: 'grunt-asset-monitor',
            px_to_rem: 'grunt-px-to-rem'
        }
    });

    function isOnlyTask(task) {
        return grunt.cli.tasks.length === 1 && grunt.cli.tasks[0] === task.name;
    }

    if (options.isDev) {
        grunt.log.subhead('Running Grunt in DEV mode');
    }

    // Default task
    grunt.registerTask('default', ['clean', 'validate', 'compile', 'test', 'analyse']);

    /**
     * Validate tasks
     */
    grunt.registerTask('validate:css', ['compile:images', 'sass:compile', 'sass:compileStyleguide']);
    grunt.registerTask('validate:sass', ['scsslint']);
    grunt.registerTask('validate:js', function(app) {
        var target = (app) ? ':' + app : '';
        grunt.task.run('jshint' + target);
    });
    grunt.registerTask('validate', function(app) {
        grunt.task.run(['validate:css', 'validate:sass', 'validate:js:' + (app || '')]);
    });

    /**
     * Compile tasks
     */

    // for backwards compatablity
    grunt.registerTask('sass:compile', ['concurrent:sass']);

    grunt.registerTask('compile:images', ['copy:images', 'shell:spriteGeneration', 'imagemin']);
    grunt.registerTask('compile:css', function() {
        grunt.task.run(['compile:images', 'concurrent:sass', 'sass:compileStyleguide', 'px_to_rem']);

        if (options.isDev) {
            grunt.task.run(['replace:cssSourceMaps', 'copy:css']);
        }

        if (isOnlyTask(this)) {
            grunt.task.run('asset_hash');
        }

    });
    grunt.registerTask('compile:js', function() {
        grunt.task.run(['requirejs', 'copy:javascript']);
        if (!options.isDev) {
            grunt.task.run('uglify:javascript');
        }

        if (isOnlyTask(this)) {
            grunt.task.run('asset_hash');
        }

    });
    grunt.registerTask('compile:fonts', ['mkdir:fontsTarget', 'webfontjson']);
    grunt.registerTask('compile:flash', ['copy:flash']);
    grunt.registerTask('compile:conf', ['copy:headJs', 'copy:headCss', 'copy:assetMap']);
    grunt.registerTask('compile', [
        'concurrent:compile',
        'compile:fonts',
        'compile:flash',
        'asset_hash',
        'compile:conf'
    ]);

    /**
     * compile:js:<requiretask> tasks. Generate one for each require task
     */
    function compileSpecificJs(requirejsName) {
        if (!options.isDev && requirejsName !== 'common') {
            grunt.task.run('requirejs:common');
        }
        grunt.task.run(['requirejs:' + requirejsName, 'copy:javascript', 'asset_hash']);
    }
    for (var requireTaskName in grunt.config('requirejs')) {
        if (requireTaskName !== 'options') {
            grunt.registerTask('compile:js:' + requireTaskName, compileSpecificJs.bind(this, requireTaskName) );
        }
    }

    /**
     * Test tasks
     */
    grunt.registerTask('test:unit', function(app) {
        var target = app ? ':' + app : '';
        grunt.config.set('karma.options.singleRun', (options.singleRun === false) ? false : true);
        grunt.task.run('karma' + target);
    });
    grunt.registerTask('test', ['test:unit']);

    /**
     * Analyse tasks
     */
    grunt.registerTask('analyse:performance', function(app) {
        var target = app ? ':' + app : '';
        grunt.task.run('pagespeed' + target);
    });
    grunt.registerTask('analyse:css', ['compile:css', 'cssmetrics:common']);
    grunt.registerTask('analyse', ['analyse:css', 'analyse:performance']);

    /**
     * Miscellaneous tasks
     */
    grunt.registerTask('hookmeup', ['clean:hooks', 'shell:copyHooks']);
    grunt.registerTask('emitAbTestInfo', 'shell:abTestInfo');

    grunt.event.on('watch', function(action, filepath, target) {
        if (target === 'js') {
            // compile just the project
            var project = filepath.split('/').shift();
            grunt.task.run(['requirejs:' + project, 'copy:javascript', 'asset_hash']);
        }
    });
};

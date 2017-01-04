var isTeamcityReporterEnabled = process.env.TEAMCITY === 'true',
    karmaReporters = [ isTeamcityReporterEnabled ? 'teamcity' : 'spec' ];

module.exports = function (config) {
    return {
        // root of project
        basePath: './../../../../',
        frameworks: ['jasmine', 'requirejs', 'phantomjs-shim'],

        files: [
            { pattern: 'static/test/javascripts/components/sinonjs/sinon.js', included: true },
            { pattern: 'static/test/javascripts/components/jasmine-sinon/lib/jasmine-sinon.js', included: true },
            { pattern: 'static/test/javascripts/setup.js', included: true },
            { pattern: 'static/test/javascripts/main.js', included: true },
            { pattern: 'static/test/javascripts/components/**/!(*.spec.js)', included: false },
            { pattern: 'static/test/javascripts/fixtures/**/*', included: false },
            { pattern: 'static/test/javascripts/helpers/**/*.js', included: false },
            { pattern: 'static/src/inline-svgs/**/*.svg', included: false },
            { pattern: 'static/src/javascripts/**/*.js', included: false },
            { pattern: 'static/src/javascripts/**/views/**/*.html', included: false },
            { pattern: 'static/public/javascripts/**/*.js', included: false },
            { pattern: 'static/vendor/javascripts/**/*.js', included: false },
        ],

        exclude: [],

        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        port: 9876,
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['PhantomJS'],
        captureTimeout: 60000,
        singleRun: false,

        reporters: karmaReporters,
        coverageReporter: {
            reporters: [
                {
                    type: 'html',
                    dir: 'tmp/coverage/'
                },
                {type: 'text-summary'}
            ],
            includeAllSources: true
        },
        preprocessors: {
            'static/src/javascripts/!(*components|vendor)/**/*.js': ['coverage'],
            'static/src/javascripts/*.js': ['coverage']
        },

        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 3,
        browserNoActivityTimeout: 60000,
        reportSlowerThan: 1000
    };
};

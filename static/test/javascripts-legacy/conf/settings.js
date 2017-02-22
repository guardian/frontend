var isTeamcityReporterEnabled = process.env.TEAMCITY === 'true',
    karmaReporters = [ isTeamcityReporterEnabled ? 'teamcity' : 'spec' ];

module.exports = function (config) {
    return {
        // root of project
        basePath: './../../../../',
        frameworks: ['jasmine', 'requirejs', 'phantomjs-shim'],

        files: [
            { pattern: 'static/test/javascripts-legacy/components/sinonjs/sinon.js', included: true },
            { pattern: 'static/test/javascripts-legacy/components/jasmine-sinon/lib/jasmine-sinon.js', included: true },
            { pattern: 'static/test/javascripts-legacy/setup.js', included: true },
            { pattern: 'static/test/javascripts-legacy/main.js', included: true },
            { pattern: 'static/test/javascripts-legacy/components/**/!(*.spec.js)', included: false },
            { pattern: 'static/test/javascripts-legacy/fixtures/**/*', included: false },
            { pattern: 'static/test/javascripts-legacy/helpers/**/*.js', included: false },
            { pattern: 'static/src/inline-svgs/**/*.svg', included: false },
            { pattern: 'static/transpiled/javascripts/**/*.js', included: false },
            { pattern: 'static/transpiled/javascripts/**/views/**/*.html', included: false },
            { pattern: 'static/public/javascripts/**/*.js', included: false },
            { pattern: 'static/vendor/javascripts/**/*.js', included: false },

            // this ugly, but also the most performant way to get
            // node_modules into karma/require
            { pattern: 'node_modules/+(bean|bonzo|react|wolfy87-eventemitter|fastclick|fastdom|fence|lodash-amd|when|qwery|reqwest|video.js|videojs-contrib-ads|text|raven-js)/**/*.js', included: false },
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
            'static/transpiled/javascripts/**/*.js': ['coverage']
        },

        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 3,
        browserNoActivityTimeout: 60000,
        reportSlowerThan: 1000
    };
};

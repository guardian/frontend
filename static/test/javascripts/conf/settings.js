var isTeamcityReporterEnabled = process.env.KARMA_TEAMCITY_REPORTER === 'true',
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
            { pattern: 'static/src/javascripts/{projects,vendor,bootstraps}/**/*.js', included: false },
            { pattern: 'static/src/javascripts/**/views/**/*.html', included: false },
            { pattern: 'static/public/javascripts/**/*.js', included: false },

            { pattern: 'node_modules/bean/**/*.js', included: false},
            { pattern: 'node_modules/bonzo/**/*.js', included: false},
            { pattern: 'node_modules/react/dist/**/*.js', included: false},
            { pattern: 'node_modules/wolfy87-eventemitter/**/*.js', included: false},
            { pattern: 'node_modules/fastdom/**/*.js', included: false},
            { pattern: 'node_modules/fence/**/*.js', included: false},
            { pattern: 'node_modules/lodash-amd/**/*.js', included: false},
            { pattern: 'node_modules/when/es6-shim/**/*.js', included: false},
            { pattern: 'node_modules/qwery/**/*.js', included: false},
            { pattern: 'node_modules/raven-js/dist/**/*.js', included: false},
            { pattern: 'node_modules/reqwest/**/*.js', included: false},
            { pattern: 'node_modules/requirejs-text/**/*.js', included: false}
        ],

        exclude: [],

        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        port: 9876,
        reporters: karmaReporters,
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
        coverageReporter: {
            reporters: [
                {
                    type: 'html',
                    dir: 'tmp/coverage/'
                },
                {type: 'text-summary'}
            ]
        },

        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 3,
        browserNoActivityTimeout: 60000,
        reportSlowerThan: 1000
    };
};

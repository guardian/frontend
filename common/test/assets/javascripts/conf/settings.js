module.exports = function(config) {
    return {
        basePath: './../../../../../static/requirejs',
        frameworks: ['jasmine', 'requirejs'],

        files: [
            { pattern: 'common-test/components/sinonjs/sinon.js', included: true },
            { pattern: 'common-test/components/jasmine-sinon/lib/jasmine-sinon.js', included: true },
            { pattern: 'common-test/components/seedrandom/index.js', included: true },
            { pattern: 'common-test/setup.js', included: true },
            { pattern: 'common-test/main.js', included: true },
            { pattern: 'common-test/components/**/*', included: false },
            { pattern: 'common-test/fixtures/**/*', included: false },
            { pattern: 'common-test/helpers/**/*.js', included: false },
            { pattern: 'common-test/spies/**/*.js', included: false },
            { pattern: 'common/**/*.js', included: false }
        ],

        exclude: [],

        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress'],
        port: 9876,
        colors: true,
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
        singleRun: false
    };
};

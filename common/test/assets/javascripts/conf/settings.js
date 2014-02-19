module.exports = function(config) {
    return {
        basePath: './../../../../../static/requirejs',
        frameworks: ['jasmine', 'requirejs'],

        files: [
            { pattern: 'tests/components/sinonjs/sinon.js', included: true },
            { pattern: 'tests/components/jasmine-sinon/lib/jasmine-sinon.js', included: true },
            { pattern: 'tests/components/seedrandom/index.js', included: true },
            { pattern: 'tests/setup.js', included: true },
            { pattern: 'tests/main.js', included: true },
            { pattern: 'tests/components/**/*', included: false },
            { pattern: 'tests/fixtures/**/*', included: false },
            { pattern: 'tests/helpers/**/*.js', included: false },
            { pattern: 'tests/spies/**/*.js', included: false },
            { pattern: 'javascripts/**/*.js', included: false }
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

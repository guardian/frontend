module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', 'requirejs'],

        files: [
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/call.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/spy.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/stub.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/util/event.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/util/fake_server.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/util/fake_server_with_clock.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/util/fake_timers.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/util/fake_xml_http_request.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/util/timers_ie.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/sinon/lib/sinon/util/xhr_ie.js', included: true },
            { pattern: 'common/test/assets/javascripts/components/seedrandom/index.js', included: true },
            { pattern: 'common/test/assets/javascripts/setup.js', included: true },
            // { pattern: 'common/test/assets/javascripts/components/sinon/**/*.js', included: true },
            { pattern: 'common/test/assets/javascripts/main.js', included: true },
            { pattern: 'common/app/assets/javascripts/**/*.js', included: false },
            { pattern: 'common/test/assets/javascripts/spec/**/*.spec.js', included: false },
            { pattern: 'common/test/assets/javascripts/fixtures/**/*', included: false },
            { pattern: 'common/test/assets/javascripts/helpers/**/*.js', included: false }
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
    });
};

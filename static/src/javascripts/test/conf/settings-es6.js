/*eslint-env node*/
module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './../../../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jspm', 'jasmine', 'phantomjs-shim'],

        jspm: {
            moduleIDs: ['test/spec/common/**/*.spec.js'],
            modulePath: 'javascripts',
            config: 'systemjs-config.js'
        },

        // list of files / patterns to load in the browser
        files: [
            { pattern: 'systemjs-normalize.js', included: true },
            { pattern: 'javascripts/test/setup.js', included: true },
            { pattern: 'javascripts/projects/**/*.js', included: false, served: true },
            { pattern: 'javascripts/es6/**/*.js', included: false, served: true },
            { pattern: 'inline-svgs/**/*.svg', included: false }
        ],

        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,
        browsers: ['PhantomJS']
    });
};

module.exports = function(config) {
  config.set({
    basePath: '../../..',
    frameworks: ['jasmine'],
    files: [
        {pattern: 'app/views/**/*.html', included: false},
        {pattern: 'public/js/components/jquery/jquery.js', included: true},
        {pattern: 'public/js/components/jquery-mockjax/jquery.mockjax.js', included: true},
        {pattern: 'public/js/components/curl/dist/curl-with-js-and-domReady/curl.js', included: true},
        {pattern: 'public/js/components/underscore/underscore.js', included: true},
        {pattern: 'public/js/**/*.js', included: false},
        {pattern: 'public/css/*.css', included: true},
        {pattern: 'public/css/!(*.css)', included: false},
        {pattern: 'test/public/config.js', included: true},
        {pattern: 'test/public/spec/**/*', included: false},
        {pattern: 'test/public/mocks/*.js', included: true},
        {pattern: 'test/public/fixtures/*.js', included: false},
        {pattern: 'test/public/test-main.js', included: true}
    ],

    exclude: [],

    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,
    autoWatch: true,

    browsers: ['PhantomJS'],
    captureTimeout: 60000,
    singleRun: false
  });
};

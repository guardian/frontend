module.exports = function(config) {
  config.set({
    basePath: '../../..',
    frameworks: ['jasmine'],
    files: [
        {pattern: 'public/jspm_packages/!(system).js', included: false},
        {pattern: 'public/jspm_packages/system.js', included: true},
        {pattern: 'public/jspm_packages/**/*', included: false},
        {pattern: 'public/js/jspm-config.js', included: true},
        {pattern: 'test/public/config.js', included: true},
        {pattern: 'app/views/**/*.html', included: false},
        {pattern: 'public/js/**/*', included: false},
        {pattern: 'public/css/*.css', included: true, watched: false},
        {pattern: 'public/css/!(*.css)', included: false, watched: false},
        {pattern: 'test/public/mocks/*.js', included: false},
        {pattern: 'test/public/spec/**/*', included: false},
        {pattern: 'test/public/utils/**/*.js', included: false},
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

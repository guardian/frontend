// Karma configuration

module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: [
      'mocha',
      'chai',
      'sinon-chai'
    ],
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-html2js-preprocessor',
      'karma-mocha',
      'karma-chai-plugins'
    ],
    files: [
      'dist/imager-all.min.js',
      'test/**/*.js',
      'test/fixtures/*.html'
    ],
    preprocessors: {
        '**/*.html': ['html2js']
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: process.env.TRAVIS ? ['Phantom'] : ['Chrome', 'Firefox', 'Safari'],
    captureTimeout: 5000
  });
};

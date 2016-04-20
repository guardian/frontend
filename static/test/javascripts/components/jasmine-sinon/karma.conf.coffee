module.exports = (config) ->
  config.set
    basePath: ''
    frameworks: ['jasmine']
    files: [
      'bower_components/sinonjs/sinon.js'
      'lib/jasmine-sinon.js'
      'spec/*.spec.js'
    ]
    reporters: ['progress']
    runnerPort: 9100
    browsers: ['Chrome', 'Firefox'],
    plugins: [
      'karma-jasmine'
      'karma-chrome-launcher'
      'karma-firefox-launcher'
    ]
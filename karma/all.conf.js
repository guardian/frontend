module.exports = function(config) {
    var defaultConfig = new require('../karma.conf.js');
    console.log(defaultConfig);
    config.set(defaultConfig);
}
// karma.files.push({ pattern: 'common/test/assets/javascripts/spec/**/*.spec.js', included: false });
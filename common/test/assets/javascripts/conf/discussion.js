module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files.push({ pattern: 'common/test/assets/javascripts/spec/discussion/**/*.js', included: false });
    config.set(settings);
}
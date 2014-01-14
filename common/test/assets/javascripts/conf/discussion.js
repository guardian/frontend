module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files.push({ pattern: 'common-test/spec/discussion/**/*.spec.js', included: false });
    config.set(settings);
}

module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files.push({ pattern: 'tests/specs/**/*.spec.js', included: false });
    config.set(settings);
}

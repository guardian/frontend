module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files.push({ pattern: 'common-test/spec/identity/**/*.js', included: false });
    config.set(settings);
}
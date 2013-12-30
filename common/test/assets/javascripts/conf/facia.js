module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files.push({ pattern: 'common-test/spec/facia/**/*.js', included: false });
    config.set(settings);
}

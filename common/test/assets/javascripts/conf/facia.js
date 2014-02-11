module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files.push(
        { pattern: 'facia/app/assets/javascripts/**/*.js', included: false },
        { pattern: 'facia/test/assets/javascripts/spec/**/*.spec.js', included: false }
    );
    config.set(settings);
}

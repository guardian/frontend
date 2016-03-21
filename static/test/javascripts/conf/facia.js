module.exports = function (config) {
    var settings = new require('./settings.js')(config);
    settings.files.push(
        { pattern: 'static/test/javascripts/spec/facia/**/*.js', included: false }
    );
    config.set(settings);
};

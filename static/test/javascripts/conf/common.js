module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files.push(
        { pattern: 'static/test/javascripts/spec/common/**/create-ad-slot.spec.js', included: false }
    );
    config.set(settings);
};

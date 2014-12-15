module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files.push(
        { pattern: 'static/test/javascripts/spec/common/**/popular-fronts.spec.js', included: false }
    );
    config.set(settings);
};

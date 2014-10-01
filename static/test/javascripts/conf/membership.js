module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files.push(
        { pattern: 'common/app//public/javascripts/vendor/stripe/stripe.min.js', included: false },
        { pattern: 'identity/app/assets/javascripts/**/*.js', included: false },
        { pattern: 'identity/test/assets/javascripts/spec/**/*.spec.js', included: false },
        { pattern: 'common/test/assets/javascripts/fixtures/membership/*.fixture.html', included: false }
    );
    settings.app = 'identity';
    config.set(settings);
};

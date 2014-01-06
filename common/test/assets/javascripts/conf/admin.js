module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files = [
        { pattern: 'admin-public/components/jquery/jquery.js', included: true },
        { pattern: 'admin-public/components/js_humanized_time_span/humanized_time_span.js', included: true },
        { pattern: 'admin-public/spec/setup.js', included: true },
        { pattern: 'admin-public/main.js', included: true },
        { pattern: 'admin-public/components/**/*.js', included: false },
        { pattern: 'admin-public/models/**/*.js', included: false },
        { pattern: 'admin-public/modules/**/*.js', included: false },
        { pattern: 'admin-public/radiator/**/*.js', included: false },
        { pattern: 'admin-public/common.js', included: false },
        { pattern: 'admin-public/spec/**/*Spec.js', included: false }
    ];
    config.set(settings);
}
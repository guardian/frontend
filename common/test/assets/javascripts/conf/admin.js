module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files = [
        { pattern: 'admin/public/javascripts/components/jquery/jquery.js', included: true },
        { pattern: 'admin/public/javascripts/components/js_humanized_time_span/humanized_time_span.js', included: true },
        { pattern: 'admin/public/javascripts/spec/setup.js', included: true },
        { pattern: 'admin/public/javascripts/main.js', included: true },
        { pattern: 'admin/public/javascripts/components/**/*.js', included: false },
        { pattern: 'admin/public/javascripts/models/**/*.js', included: false },
        { pattern: 'admin/public/javascripts/modules/**/*.js', included: false },
        { pattern: 'admin/public/javascripts/radiator/**/*.js', included: false },
        { pattern: 'admin/public/javascripts/common.js', included: false },
        { pattern: 'admin/public/javascripts/spec/**/*Spec.js', included: false }
    ];
    config.set(settings);
}
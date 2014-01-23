module.exports = function(config) {
    var settings = new require('./settings.js')(config);
    settings.files = [
        { pattern: 'javascriptsc/components/jquery/jquery.js', included: true },
        { pattern: 'javascripts/components/js_humanized_time_span/humanized_time_span.js', included: true },
        { pattern: 'javascripts/spec/setup.js', included: true },
        { pattern: 'javascripts/main.js', included: true },
        { pattern: 'javascripts/components/**/*.js', included: false },
        { pattern: 'javascripts/models/**/*.js', included: false },
        { pattern: 'javascripts/modules/**/*.js', included: false },
        { pattern: 'javascripts/radiator/**/*.js', included: false },
        { pattern: 'javascripts/common.js', included: false }
    ];
    config.set(settings);
}

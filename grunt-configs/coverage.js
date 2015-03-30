module.exports = function(grunt, options) {
    return {
        preprocessors: {
            'static/src/javascripts/**/*.js': ['coverage'],
            'static/public/javascripts/**/*.js': ['coverage']
        }
    };
};

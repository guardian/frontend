module.exports = function () {
    return {
        preprocessors: {
            'static/src/javascripts/**/*.js': ['coverage'],
            'static/public/javascripts/**/*.js': ['coverage']
        }
    };
};

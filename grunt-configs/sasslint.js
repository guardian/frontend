module.exports = function () {
    return {
        target: [
            'static/src/stylesheets/**/*.scss'
        ],
        options: {
            configFile: '.sass-lint.yml'
        }
    };
};

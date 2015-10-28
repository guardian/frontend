module.exports = function (grunt, options) {
    return {
        js: {
            src: [
                options.staticTargetDir + 'javascripts/core.js',
                options.staticTargetDir + 'javascripts/bootstraps/*.js'
            ]
        }
    };
};

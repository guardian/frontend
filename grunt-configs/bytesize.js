module.exports = function (grunt, options) {
    return {
        js: {
            src: [
                options.staticTargetDir + 'javascripts/enhanced-vendor.js',
                options.staticTargetDir + 'javascripts/standard.js',
                options.staticTargetDir + 'javascripts/bootstraps/*.js'
            ]
        }
    };
};

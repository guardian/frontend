module.exports = function(grunt, options) {
    return {
        common: {
            src: [
                options.staticTargetDir + 'javascripts/bootstraps/*.js',
                options.staticTargetDir + 'stylesheets/*.css'
            ],
            options: {
                credentials: options.propertiesFile
            }
        }
    };
};

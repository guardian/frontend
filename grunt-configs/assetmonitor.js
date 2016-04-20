module.exports = function (grunt, options) {
    return {
        common: {
            src: [
                options.staticTargetDir + 'javascripts/bootstraps/*.js',
                options.staticTargetDir + 'stylesheets/*.css',
                '!' + options.staticTargetDir + 'stylesheets/*head.identity.css'
            ],
            options: {
                credentials: options.propertiesFile
            }
        }
    };
};

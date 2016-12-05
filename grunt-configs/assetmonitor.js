module.exports = function (grunt, options) {
    return {
        common: {
            src: [
                options.staticTargetDir + 'javascripts/**/*.js',
                '!' + options.staticTargetDir + 'javascripts/components/**/*.js',
                '!' + options.staticTargetDir + 'javascripts/vendor/**/*.js',
                options.staticTargetDir + 'stylesheets/**/*.css',
                '!' + options.staticTargetDir + 'stylesheets/*head.identity.css'
            ],
            options: {
                credentials: options.propertiesFile
            }
        }
    };
};

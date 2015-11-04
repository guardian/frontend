module.exports = function (grunt, options) {
    return {
        common: {
            src: [options.staticTargetDir + 'stylesheets/**/*.css'],
            options: {
                quiet: false,
                maxRules: 4096, //IE max rules
                maxFileSize: 1048576 //1mb in bytes
            }
        }
    };
};

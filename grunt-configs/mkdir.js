module.exports = function(grunt, options) {
    return {
        fontsTarget: {
            options: {
                create: [options.staticTargetDir + 'fonts']
            }
        }
    };
};

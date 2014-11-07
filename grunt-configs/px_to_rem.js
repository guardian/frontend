module.exports = function(grunt, options) {
    return {
        dist: {
            options: {
                base: 16,
                fallback: true // set to false when Opera Mini supports rem units
            },
            files: [{
                expand: true,
                cwd: options.staticTargetDir + 'stylesheets/',
                src: ['*.css', '!old-ie*'],
                dest: options.staticTargetDir + 'stylesheets/'
            }]
        }
    };
};

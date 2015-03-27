module.exports = function(grunt, options) {
    return {
        dist: {
            options: {
                map: options.isDev,
                base: 16,
                fallback: false
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

module.exports = function(grunt, options) {
    return {
        dist: {
            options: {
                base: 16,
                fallback: false // Opera Mini gets its own global.px.css
            },
            files: [{
                expand: true,
                cwd: options.staticTargetDir + 'stylesheets/',
                src: ['*.css', '!old-ie*', '!*.px.css'],
                dest: options.staticTargetDir + 'stylesheets/'
            }]
        }
    };
};

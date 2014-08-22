module.exports = function(grunt, options) {
    return {
        js: [
            options.staticTargetDir + 'javascripts',
            options.staticHashDir + 'javascripts',
            options.requirejsDir
        ],
        css: [
            options.staticTargetDir + 'stylesheets',
            options.staticHashDir + 'stylesheets'
        ],
        images: [
            options.staticTargetDir + 'images',
            options.staticHashDir + 'images'
        ],
        flash: [
            options.staticTargetDir + 'flash',
            options.staticHashDir + 'flash'
        ],
        fonts: [
            options.staticTargetDir + 'fonts',
            options.staticHashDir + 'fonts'
        ],
        // Clean any pre-commit hooks in .git/hooks directory
        hooks: ['.git/hooks'],
        assets: ['common/conf/assets']
    };
};

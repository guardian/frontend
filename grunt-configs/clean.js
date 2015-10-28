module.exports = function (grunt, options) {
    return {
        js: [
            options.staticTargetDir + 'javascripts',
            options.staticHashDir + 'javascripts',
            options.staticHashDir + 'bundles',
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
        assets: [
            'common/conf/assets',
            options.staticHashDir + 'assets'
        ],
        // Clean any pre-commit hooks in .git/hooks directory
        hooks: ['.git/hooks']
    };
};

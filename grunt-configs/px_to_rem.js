/* Chrome doesn't recognise rems on SVG stroke-width property (https://code.google.com/p/chromium/issues/detail?id=470449) so we ignore that in the px conversion to rems */

module.exports = function (grunt, options) {
    return {
        dist: {
            options: {
                map: options.isDev,
                base: 16,
                fallback: false,
                ignore: ['stroke-width']
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

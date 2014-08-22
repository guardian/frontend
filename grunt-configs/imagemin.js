var pngquant = require('imagemin-pngquant');

module.exports = function(grunt, options) {
    return {
        options: {
            optimizationLevel: 2,
            use: [pngquant()]
        },
        files: {
            expand: true,
            cwd: options.staticTargetDir + 'images/',
            src: ['**/*.{png,gif,jpg}', '!favicons/windows_tile_144_b.png'],
            dest: options.staticTargetDir + 'images'
        }
    };
};

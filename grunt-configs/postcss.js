var autoprefixer = require('autoprefixer');

module.exports = function (grunt, options) {
    var dir = options.staticTargetDir + 'stylesheets/';
    return {
        modern: {
            files: [{
                expand: true,
                cwd: dir,
                src: ['*.css', '!{_*,ie9.*,old-ie.*,webfonts*}'],
                dest: dir
            }],
            options: {
                // browserslist for 'modern' is specified in /browserslist
                map: options.isDev,
                processors: [
                    autoprefixer()
                ]
            }
        },
        'old-ie': {
            files: [{
                expand: true,
                cwd: dir,
                src: ['old-ie.*.css'],
                dest: dir
            }],
            options: {
                processors: [
                    autoprefixer({browsers: 'Explorer 8'})
                ]
            }
        },
        ie9: {
            files: [{
                expand: true,
                cwd: dir,
                src: ['ie9.*.css'],
                dest: dir
            }],
            options: {
                processors: [
                    autoprefixer({browsers: 'Explorer 9'})
                ]
            }
        }
    };
};

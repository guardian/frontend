module.exports = function (grunt, options) {
    var sassDir = 'static/src/stylesheets';

    return {
        options: {
            outputStyle: 'compressed',
            sourceMap: options.isDev,
            precision: 5
        },
        compileStyleguide: {
            files: [{
                expand: true,
                cwd: 'docs/styleguide/assets/scss/',
                src: ['*.scss', '!_*'],
                dest: 'docs/styleguide/assets/css/',
                rename: function (dest, src) {
                    return dest + src.replace('scss', 'css');
                }
            }]
        },
        'old-ie': {
            files: [{
                expand: true,
                cwd: sassDir,
                src: ['old-ie.*.scss'],
                dest: options.staticTargetDir + 'stylesheets/',
                rename: function (dest, src) {
                    return dest + src.replace('scss', 'css');
                }
            }]
        },
        ie9: {
            files: [{
                expand: true,
                cwd: sassDir,
                src: ['ie9.*.scss'],
                dest: options.staticTargetDir + 'stylesheets/',
                rename: function (dest, src) {
                    return dest + src.replace('scss', 'css');
                }
            }]
        },
        modern: {
            files: [{
                expand: true,
                cwd: sassDir,
                src: ['*.scss', '!{_*,ie9.*,old-ie.*}'],
                dest: options.staticTargetDir + 'stylesheets/',
                rename: function (dest, src) {
                    return dest + src.replace('scss', 'css');
                }
            }]
        },
        inline: {
            files: [{
                expand: true,
                cwd: sassDir,
                src: ['inline/*.scss'],
                dest: options.staticTargetDir + 'stylesheets/',
                rename: function (dest, src) {
                    return dest + src.replace('scss', 'css');
                }
            }]
        }
    };
};

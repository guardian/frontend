module.exports = function(grunt, options) {
    var sassDir = 'common/app/assets/stylesheets';

    return {
        options: {
            style: 'compressed',
            sourcemap: options.isDev,
            noCache: true,
            quiet: options.isDev ? false : true
        },
        compileStyleguide: {
            files: [{
                expand: true,
                cwd: 'docs/styleguide/assets/scss/',
                src: ['*.scss', '!_*'],
                dest: 'docs/styleguide/assets/css/',
                rename: function(dest, src) {
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
                rename: function(dest, src) {
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
                rename: function(dest, src) {
                    return dest + src.replace('scss', 'css');
                }
            }]
        },
        modern: {
            files: [{
                expand: true,
                cwd: sassDir,
                src: options.isDev ?
                    ['global.scss', 'head.default.scss', 'head.facia.scss'] :
                    ['*.scss', '!{_*,ie9.*,old-ie.*}'],
                dest: options.staticTargetDir + 'stylesheets/',
                rename: function(dest, src) {
                    return dest + src.replace('scss', 'css');
                }
            }]
        }
    };
};

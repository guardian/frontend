module.exports = function(grunt, options) {
    return {
        compile: {
            files: [{
                expand: true,
                cwd: 'common/app/assets/stylesheets',
                src: ['*.scss', '!_*'],
                dest: options.staticTargetDir + 'stylesheets/',
                rename: function(dest, src) {
                    return dest + src.replace('scss', 'css');
                }
            }],
            options: {
                style: 'compressed',
                sourcemap: true,
                noCache: true,
                quiet: options.isDev ? false : true
            }
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
            }],
            options: {
                style: 'compressed',
                sourcemap: true,
                noCache: true,
                quiet: options.isDev ? false : true
            }
        }
    };
};

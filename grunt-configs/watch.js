module.exports = function(grunt, options) {
    return {
        js: {
            // using watch event to just compile changed project
            files: ['*/app/{assets, public}/javascripts/**/*.js', '!**/components/**'],
            options: {
                spawn: false
            }
        },
        css: {
            files: ['common/app/assets/stylesheets/**/*.scss'],
            tasks: ['sass:compile', 'asset_hash'],
            options: {
                spawn: false
            }
        },
        images: {
            files: ['common/app/{assets, public}/images/**/*'],
            tasks: ['compile:images']
        },
        flash: {
            files: ['common/app/public/flash/**/*'],
            tasks: ['compile:flash']
        },
        fonts: {
            files: ['resources/fonts/**/*'],
            tasks: ['compile:fonts']
        },
        styleguide: {
            files: ['common/app/assets/stylesheets/**/*.scss', 'docs/styleguide/**/*.scss', 'docs/styleguide_templates/**/*.html'],
            tasks: ['compile:css', 'hologram'],
            options: {
                spawn: false
            }
        }
    };
};

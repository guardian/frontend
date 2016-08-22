var autoprefixer = require('autoprefixer');

module.exports = function (grunt, options) {
    var dir = options.staticTargetDir + 'stylesheets/';

    // Modern browsers list for auto-prefixer
    // NOTE: This is an alternative to using a browserslist file, keeping configuration more in context
    // and less magic than than using the https://github.com/ai/browserslist file
    var modernBrowsers = [
        'Firefox >= 26',
        'Explorer >= 10',
        'Safari >= 5',
        'Chrome >= 36',

        'iOS >= 5',
        'Android >= 2',
        'BlackBerry >= 6',
        'ExplorerMobile >= 7',

        '> 2% in US',
        '> 2% in AU',
        '> 2% in GB'
    ];

    return {
        modern: {
            files: [{
                expand: true,
                cwd: dir,
                src: ['*.css', '!{_*,ie9.*,old-ie.*,webfonts*}'],
                dest: dir
            }],
            options: {
                map: options.isDev,
                processors: [
                    autoprefixer({
                        browsers: modernBrowsers
                    })
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

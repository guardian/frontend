module.exports = function(grunt, options) {
    return {
        options: {
            jshintrc: './static/src/javascripts/.jshintrc'
        },
        self: [
            'Gruntfile.js'
        ],
        common: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/common',
                src: [
                    '**/*.js',
                    '!utils/atob.js'
                ]
            }]
        },
        facia: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/facia',
                src: [
                    '**/*.js'
                ]
            }]
        },
        faciaTool: {
            files: [{
                expand: true,
                cwd: 'facia-tool/public/js/',
                src: [
                    '**/*.js',
                    '!jspm-config.js'
                ]
            }],
            options: {
                jshintrc: './facia-tool/public/.jshintrc'
            }
        },
        membership: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/membership',
                src: [
                    '**/*.js'
                ]
            }]
        },
        bootstraps: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/bootstraps',
                src: [
                    '**/*.js'
                ]
            }]
        }
    };
};

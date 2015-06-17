module.exports = function(grunt, options) {
    return {
        common: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/projects/common',
                src: [
                    '**/*.js',
                    '!modules/discussion/comment-box.js',
                    '!modules/discussion/comments.js',
                    '!modules/discussion/loader.js'
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
                cwd: 'facia-tool/public/javascripts/',
                src: [
                    '**/*.js',
                    '!components/**',
                    '!**/*.js'
                ]
            }]
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

module.exports = function(grunt, options) {
    var dir = options.staticTargetDir + 'stylesheets/';
    return {
        modern: {
            files: [{
                expand: true,
                cwd: dir,
                src: ['*.css', '!{_*,ie9.*,old-ie.*}'],
                dest: dir
            }],
            options: {
              map: true,
              diff: true
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
                browsers: ['Explorer 8']
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
                browsers: ['ie 9']
            }
        }
    }
};

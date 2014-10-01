module.exports = function(grunt, options) {
    return {
        options: {
            jshintrc: './resources/jshint_conf.json'
        },
        self: [
            'Gruntfile.js'
        ],
        common: {
            files: [{
                expand: true,
                cwd: 'static/src/javascripts/',
                src: ['**/*.js', '!components/**', '!bower_components/**', '!utils/atob.js']
            }]
        },
        facia: {
            files: [{
                expand: true,
                cwd: 'facia/app/assets/javascripts/',
                src: ['**/*.js']
            }]
        },
        faciaTool: {
            files: [{
                expand: true,
                cwd: 'facia-tool/public/javascripts/',
                src: ['**/*.js', '!components/**', '!omniture.js']
            }]
        },
        membership: {
            files: [{
                expand: true,
                cwd: 'identity/app/assets/javascripts/',
                src: ['**/*.js']
            }]
        }
    };
};

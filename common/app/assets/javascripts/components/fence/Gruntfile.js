module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 9001,
                    keepalive: true
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'src/*.js'
                // 'test/spec/{,*/}*.js'
            ]
        },
    });

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    // Default task(s).
    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('default', ['test', 'connect']);

};

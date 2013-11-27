'use strict';

module.exports = function(grunt) {

    grunt.initConfig({

        cssmetrics: {
            dev: {
                src: [
                    'test/*.min.css'
                ],
                options: {
                    quiet: false,
                    maxSelectors: 4000,
                    maxFileSize: 1024000000
                }
            }
        },

        jshint: {
            all: [
                'gruntfile.js',
                'tasks/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        }

    });

    grunt.loadTasks('tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'cssmetrics:dev']);
};
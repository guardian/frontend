// jshint es3:false, node:true
module.exports = function (grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({

        // Store your Package file so you can reference its specific data whenever necessary
        pkg: grunt.file.readJSON('package.json'),

        imageDirectory: 'Demo - Grunt/Assets/Images/',

        responsive_images: {
            dev: {
                options: {
                    sizes: [
                        {
                            width: 320,
                        },
                        {
                            width: 640
                        },
                        {
                            width: 1024
                        }
                    ]
                },
                files: [{
                    expand: true,
                    cwd: '<%= imageDirectory %>',
                    src: ['*.{jpg,gif,png}'],
                    dest: '<%= imageDirectory %>Generated/'
                }]
            }
        },

        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            unit: {
                background: true
            },
            ci: {
                singleRun: true,
                reporters: ['dots'],
                browsers: ['PhantomJS']
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            core: {
                src: ['src/**/*.js']
            },
            tests: {
                src: ['test/**/*.js'],
                options: {
                    globals: {
                        expect: true,
                        describe: true,
                        it: true
                    }
                }
            }
        },

        uglify: {
            strategy: {
                src: ['src/imager.js', 'src/strategies/<%= grunt.task.current.args[0] %>.js'],
                dest: 'dist/imager-<%= grunt.task.current.args[0] %>.min.js'
            },
            'strategy-all': {
                src: ['src/imager.js', 'src/strategies/*.js'],
                dest: 'dist/imager-all.min.js'
            },
            legacy: {
                src: 'Imager.js',
                dest: 'dist/imager-legacy.min.js'
            },
            options: {
                report: 'gzip'
            }
        },

        watch: {
            tests: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: ['uglify:strategy-all', 'karma:unit:run']
            }
        }
    });

    // Load NPM Tasks
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default Task
    grunt.registerTask('default', ['responsive_images:dev']);
    grunt.registerTask('debug', ['karma:unit', 'watch']);
    grunt.registerTask('build', ['uglify:strategy:container', 'uglify:strategy:replacer', 'uglify:strategy-all', 'uglify:legacy']);
    grunt.registerTask('test', ['jshint', 'uglify:strategy-all', 'karma:ci']);

};

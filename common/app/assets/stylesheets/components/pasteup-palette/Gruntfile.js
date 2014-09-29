module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-sassdoc');
    grunt.loadNpmTasks('grunt-scss-lint');

    grunt.task.renameTask('release', 'git-release');

    grunt.initConfig({
        clean: {
            docs: [
                'docs'
            ],
        },
        scsslint: {
            options: {
                bundleExec: true,
                config: 'scss-lint.yml',
                reporterOutput: null
            },
            palette: [
                'src/**/_*.scss'
            ]
        },
        sass: {
            options: {
                bundleExec: true
            },
            demo: {
                options: {
                    style: 'expanded',
                    sourcemap: 'none'
                },
                files:  [{
                    expand: true,
                    cwd: 'demo',
                    src: [
                        '**/*.scss'
                    ],
                    dest: 'demo',
                    ext: '.css'
                }]
            }
        },
        sassdoc: {
            palette: {
                src: 'src',
                dest: 'docs'
            }
        },
        'gh-pages': {
            docs: {
                options: {
                    base: './',
                    message: 'Releasing docs and demo to http://guardian.github.io/pasteup-palette/'
                },
                src: [
                    'demo/**/*',
                    'docs/**/*',
                ]
            }
        },
        'git-release': {
            options: {
                file: 'bower.json',
                npm: false
            }
        }
    });

    grunt.registerTask('validate', ['scsslint']);
    grunt.registerTask('build:demo', ['sass:demo']);
    grunt.registerTask('docs', ['clean:docs', 'sassdoc:palette']);
    grunt.registerTask('release', function (type) {
        var releaseTarget = type ? ':' + type : '';
        grunt.task.run([
            'validate', 'git-release' + releaseTarget, 'build:demo', 'docs', 'gh-pages:docs'
        ]);
    });
};

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-sassdoc');
    grunt.loadNpmTasks('grunt-scss-lint');

    grunt.task.renameTask('release', 'git-release');

    grunt.initConfig({
        // if you update this, don't forget to update ./src/_webfonts.config.scss#L18
        fontsVersion: '1.0.0',

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
            webfonts: [
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
            webfonts: {
                src: 'src',
                dest: 'docs'
            }
        },
        aws_s3: {
            options: {
                uploadConcurrency: 5,
                differential: true,
                displayChangesOnly: true
            },
            pasteup: {
                options: {
                    accessKeyId: grunt.option('id'),
                    secretAccessKey: grunt.option('secret'),
                    region: 'eu-west-1',
                    bucket: 'pasteup-prod',
                    access: '',
                    params: {
                        CacheControl: 'max-age=315360000',
                        GrantFullControl: 'id=d6760a17be54adc770b35167669a729e90fe1649322113a6aea68af641337042',
                        GrantRead: 'uri=http://acs.amazonaws.com/groups/global/AllUsers'
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'webfonts',
                    src: [
                        '**/*.{eot,svg,ttf,woff,woff2}',
                    ],
                    dest: 'fonts/<%= fontsVersion %>'
                }]
            }
        },
        'gh-pages': {
            docs: {
                options: {
                    base: './',
                    message: 'Releasing docs to http://guardian.github.io/guss-webfonts/'
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
    grunt.registerTask('docs', ['clean:docs', 'sassdoc:webfonts']);
    grunt.registerTask('release', function (type) {
        var releaseTarget = type ? ':' + type : '';
        grunt.task.run([
            'validate', 'git-release' + releaseTarget, 'build:demo', 'docs', 'gh-pages:docs'
        ]);
    });
    grunt.registerTask('release:fonts', ['aws_s3:pasteup']);
};

/* global module: false */
module.exports = function (grunt) {
    var isDev = grunt.option('dev') || process.env.GRUNT_ISDEV === '1',
        jasmineSpec = grunt.option('spec') || '*',
        env = grunt.option('env') || 'code',
        screenshotsDir = './screenshots',
        staticTargetDir = 'static/target/',
        testConfDir = 'common/test/assets/javascripts/conf/';

    if (isDev) {
        grunt.log.subhead('Running Grunt in DEV mode');
    }

    // Project configuration.
    grunt.initConfig({

        /***********************************************************************
         * Compile
         **********************************************************************/
        sass: {
            compile: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/stylesheets',
                    src: ['*.scss', '!_*'],
                    dest: staticTargetDir + 'stylesheets/',
                    rename: function(dest, src) {
                        return dest + src.replace('scss', 'css');
                    }
                }],
                options: {
                    style: (isDev) ? 'expanded' : 'compressed',
                    sourcemap: false,
                    noCache: (isDev) ? false : true,
                    quiet: (isDev) ? false : true,
                    loadPath: [
                        'common/app/assets/stylesheets/components/sass-mq',
                        'common/app/assets/stylesheets/components/pasteup/sass/layout',
                        'common/app/assets/stylesheets/components/normalize-scss'
                    ]
                }
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: "common/app/assets/javascripts",
                    name: "bootstraps/app",
                    out: staticTargetDir + "javascripts/bootstraps/app.js",
                    paths: {
                        "bean": "components/bean/bean",
                        "bonzo": "components/bonzo/src/bonzo",
                        "domReady": "components/domready/ready",
                        "EventEmitter": "components/eventEmitter/EventEmitter",
                        "qwery": "components/qwery/mobile/qwery-mobile",
                        "reqwest": "components/reqwest/src/reqwest",
                        "postscribe": "components/postscribe/dist/postscribe",
                        "swipe": "components/swipe/swipe",
                        "swipeview": "components/swipeview/src/swipeview",
                        "lodash": "components/lodash-amd/modern",
                        imager:       '../../../app/assets/javascripts/components/imager.js/src/strategies/container'
                    },
                    shim: {
                        "postscribe": {
                            exports: "postscribe"
                        },
                        imager: {
                            deps: ['../../../app/assets/javascripts/components/imager.js/src/imager'],
                            exports: 'Imager'
                        }
                    },
                    wrap: {
                        "startFile": "common/app/assets/javascripts/components/curl/dist/curl-with-js-and-domReady/curl.js",
                        "endFile": "common/app/assets/javascripts/bootstraps/go.js"
                    },
                    optimize: (isDev) ? 'none' : 'uglify2',
                    useSourceUrl: (isDev) ? true : false,
                    preserveLicenseComments: false
                }
            }
        },

        // Create JSON web font files from fonts. See https://github.com/ahume/grunt-webfontjson
        webfontjson: {
            WebAgateSansWoff: {
                options: {
                    "filename": staticTargetDir + "fonts/WebAgateSans.woff.json",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "AgateSans",
                            "file": "resources/fonts/AgateSans-Regular.woff",
                            "format": "woff"
                        }
                    ]
                }
            },
            WebAgateSansTtf: {
                options: {
                    "filename": staticTargetDir + "fonts/WebAgateSans.ttf.json",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "AgateSans",
                            "file": "resources/fonts/AgateSans-Regular.ttf",
                            "format": "ttf"
                        }
                    ]
                }
            },
            WebEgyptianWoff: {
                options: {
                    "filename": staticTargetDir + "fonts/WebEgyptian.woff.json",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "EgyptianText",
                            "file": "resources/fonts/EgyptianText-Regular.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-style": "italic",
                            "file": "resources/fonts/EgyptianText-RegularItalic.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-weight": "700",
                            "file": "resources/fonts/EgyptianText-Medium.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "200",
                            "file": "resources/fonts/EgyptianHeadline-Light.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "400",
                            "file": "resources/fonts/EgyptianHeadline-Regular.woff",
                            "format": "woff"
                        },
                        // This weight contains only a certain set of chars
                        // since it is used only in one place (section names)
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "900",
                            "file": "resources/fonts/EgyptianHeadline-Semibold-redux.woff",
                            "format": "woff"
                        }
                    ]
                }
            },
            WebEgyptianTtf: {
                options: {
                    "filename": staticTargetDir + "fonts/WebEgyptian.ttf.json",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "EgyptianText",
                            "file": "resources/fonts/EgyptianText-Regular.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-style": "italic",
                            "file": "resources/fonts/EgyptianText-RegularItalic.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-weight": "700",
                            "file": "resources/fonts/EgyptianText-Medium.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "200",
                            "file": "resources/fonts/EgyptianHeadline-Light.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "400",
                            "file": "resources/fonts/EgyptianHeadline-Regular.ttf",
                            "format": "ttf"
                        },
                        // This weight contains only a certain set of chars
                        // since it is used only in one place (section names)
                        {
                            "font-family": "EgyptianHeadline",
                            "font-weight": "900",
                            "file": "resources/fonts/EgyptianHeadline-Semibold-redux.ttf",
                            "format": "ttf"
                        }
                    ]
                }
            }
        },

        shell: {
            spriteGeneration: {
                command: [
                    'cd tools/sprites/',
                    'node spricon.js global-icon-config.json'
                ].join('&&'),
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true
                }
            },
            /**
             * Using this task to copy hooks, as Grunt's own copy task doesn't preserve permissions
             */
            copyHooks: {
                command: 'cp git-hooks/pre-commit .git/hooks/',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: false
                }
            }
        },

        imagemin: {
            files: {
                expand: true,
                cwd: staticTargetDir + 'images/',
                src: ['**/*.{png,gif,jpg}', '!favicons/windows_tile_144_b.png'],
                dest: staticTargetDir + 'images'
            }
        },

        copy: {
            js: {
                files: [{
                    expand: true,
                    cwd: 'common/app/public/javascripts',
                    src: ['**/*.js'],
                    dest: staticTargetDir + 'javascripts'
                }]
            },
            images: {
                files: [{
                    expand: true,
                    cwd: 'common/app/public/images',
                    src: ['**/*'],
                    dest: staticTargetDir + 'images'
                }]
            },
            flash: {
                files: [{
                    expand: true,
                    cwd: 'common/app/public/flash',
                    src: ['**/*.swf'],
                    dest: staticTargetDir + 'flash'
                }]
            },
            headCss: {
                files: [{
                    expand: true,
                    cwd: 'static/target/stylesheets',
                    src: ['**/head*.css'],
                    dest: 'common/conf/assets'
                }]
            },
            /**
             * NOTE: not using this as doesn't preserve file permissions (using shell:copyHooks instead)
             * Waiting for Grunt 0.4.3 - https://github.com/gruntjs/grunt/issues/615
             */
            hooks: {
                files: [{
                    expand: true,
                    cwd: 'git-hooks',
                    src: ['*'],
                    dest: '.git/hooks/'
                }]
            }
        },

        hash: {
            options: {
                // assets.map must go where Play can find it from resources at runtime.
                // Everything else goes into frontend-static bundling.
                mapping: 'common/conf/assets/assets.map',
                srcBasePath: staticTargetDir,
                destBasePath: staticTargetDir,
                flatten: false,
                hashLength: (isDev) ? 0 : 32
            },
            files: {
                expand: true,
                cwd: staticTargetDir,
                src: '**/*',
                filter: 'isFile',
                dest: staticTargetDir,
                rename: function(dest, src) {
                    // remove .. when hash length is 0
                    return dest + src.split('/').slice(0, -1).join('/');
                }
            }
        },

        uglify: {
            vendor: {
                files: [{
                    expand: true,
                    cwd: staticTargetDir + 'javascripts/vendor/',
                    src: '**/*.js',
                    dest: staticTargetDir + 'javascripts/vendor/'
                }]
            }
        },


        /***********************************************************************
         * Test
         **********************************************************************/

        karma: {
            options: {
                configFile: testConfDir + 'all.js'
            },
            continuous: {
                singleRun: true
            },
            dev: {
                reporters: 'dots'
            },
            facia: {
                configFile: testConfDir + 'facia.js'
            },
            discussion: {
                configFile: testConfDir + 'discussion.js'
            },
            admin: {
                configFile: testConfDir + 'admin.js'
            }
        },

        jasmine: {
            options: {
                template: require('grunt-template-jasmine-requirejs'),
                keepRunner: true,
                vendor: [
                    'common/test/assets/javascripts/components/sinonjs/sinon.js',
                    'common/test/assets/javascripts/components/jasmine-sinon/lib/jasmine-sinon.js',
                    'common/test/assets/javascripts/components/seedrandom/index.js'
                ],
                helpers: 'common/test/assets/javascripts/setup.js',
                outfile: 'common-spec-runner.html',
                templateOptions: {
                    requireConfig: {
                        baseUrl: 'common/app/assets/javascripts/',
                        paths: {
                            common:       'common',
                            analytics:    'modules/analytics',
                            bonzo:        'components/bonzo/src/bonzo',
                            qwery:        'components/qwery/mobile/qwery-mobile',
                            bean:         'components/bean/bean',
                            reqwest:      'components/reqwest/src/reqwest',
                            domwrite:     'components/dom-write/dom-write',
                            EventEmitter: 'components/eventEmitter/EventEmitter',
                            swipe:        'components/swipe/swipe',
                            swipeview:    'components/swipeview/src/swipeview',
                            moment:       'components/moment/moment',
                            lodash:       'components/lodash-amd/modern',
                            omniture:     '../../../app/public/javascripts/vendor/omniture',
                            fixtures:     '../../../test/assets/javascripts/fixtures',
                            helpers:      '../../../test/assets/javascripts/helpers',
                            imager:       '../../../app/assets/javascripts/components/imager.js/src/strategies/container'
                        },
                        shim: {
                            imager: {
                                deps: ['../../../app/assets/javascripts/components/imager.js/src/imager'],
                                exports: 'Imager'
                            }
                        }
                    }
                }
            },
            common: {
                options: {
                    specs: 'common/test/assets/javascripts/spec/' + jasmineSpec + '.spec.js'
                }
            },
            facia: {
                options: {
                    specs: [
                        'common/test/assets/javascripts/spec/facia/' + jasmineSpec + '.spec.js'
                    ]
                }
            },
            discussion: {
                options: {
                    specs: grunt.file.expand(
                        'common/test/assets/javascripts/spec/discussion/' + jasmineSpec + '.spec.js', [
                            '!common/test/assets/javascripts/spec/discussion/CommentBox.spec.js'
                        ]
                    )
                }
            },
            admin: {
                options: {
                    specs: 'admin/public/javascripts/spec/**/' + jasmineSpec + 'Spec.js',
                    vendor: [
                        'admin/public/javascripts/components/jquery/jquery.js',
                        'admin/public/javascripts/components/js_humanized_time_span/humanized_time_span.js'
                    ],
                    helpers: 'admin/public/javascripts/spec/setup.js',
                    outfile: 'admin-spec-runner.html',
                    templateOptions: {
                        requireConfig: {
                            baseUrl: 'admin/public/javascripts/',
                            paths: {
                                Common:       'common',
                                TagSearch:    'modules/TagSearch',
                                AutoComplete: 'modules/AutoComplete',
                                tagEntry:     'modules/tagEntry',
                                ItemSearch:   'modules/ItemSearch',
                                EventEmitter: 'components/eventEmitter/EventEmitter',
                                Reqwest:      'components/reqwest/reqwest',
                                knockout:     'components/knockout/build/output/knockout-latest'
                            }
                        }
                    }
                }
            }
        },

        // Lint Javascript sources
        jshint: {
            options: require('./resources/jshint_conf'),
            self: [
                'Gruntfile.js'
            ],
            common: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/javascripts/',
                    src: ['**/*.js', '!components/**', '!utils/atob.js']
                }]
            }
        },

        // Much of the CasperJS setup borrowed from smlgbl/grunt-casperjs-extra
        env: {
            casperjs: {
                ENVIRONMENT : (process.env.ENVIRONMENT) ? process.env.ENVIRONMENT : (isDev) ? "dev" : "code",
                PHANTOMJS_EXECUTABLE : "node_modules/casperjs/node_modules/.bin/phantomjs",
                extend: {
                    PATH: {
                        value: 'node_modules/.bin',
                        delimiter: ':'
                    }
                }
            }
        },

        casperjsLogFile: 'results.xml',
        casperjs: {
            options: {
                // Pre-prod environments have self-signed SSL certs
                ignoreSslErrors: 'yes',
                includes: ['integration-tests/casper/tests/shared.js'],
                xunit: 'integration-tests/target/casper/<%= casperjsLogFile %>',
                loglevel: 'debug',
                direct: true
            },
            screenshot: {
                src: ['tools/screenshots/screenshot.js']
            },
            all: {
                src: ['integration-tests/casper/tests/**/*.spec.js']
            },
            admin: {
                src: ['integration-tests/casper/tests/admin/*.spec.js']
            },
            common : {
                src: ['integration-tests/casper/tests/**/*.spec.js']
            },
            discussion: {
                src: ['integration-tests/casper/tests/discussion/*.spec.js']
            },
            gallery: {
                src: ['integration-tests/casper/tests/gallery/*.spec.js']
            },
            article: {
                src: ['integration-tests/casper/tests/article/article.spec.js']
            },
            applications: {
                src: ['integration-tests/casper/tests/applications/*.spec.js']
            },
            facia: {
                src: ['integration-tests/casper/tests/facia/*.spec.js']
            },
            corenavigation: {
                src: ['integration-tests/casper/tests/core-navigation/*.js']
            },
            allexceptadmin: {
                src: ['integration-tests/casper/tests/!(*admin)/*.spec.js']
            }
        },


        /*
         * Analyse
         */
        cssmetrics: {
            common: {
                src: [staticTargetDir + 'stylesheets/**/*.css'],
                options: {
                    quiet: false,
                    maxRules: 4096, //IE max rules
                    maxFileSize: 1048576 //1mb in bytes
                }
            }
        },

        /*
         * Miscellaneous
         */
        mkdir: {
            screenshots: {
                options: {
                    create: [screenshotsDir]
                }
            },
            fontsTarget: {
                options: {
                    create: [staticTargetDir + 'fonts']
                }
            }
        },

        s3: {
            options: {
                bucket: 'aws-frontend-store',
                access: 'public-read',
                gzip: true
            },
            screenshots: {
                upload: [{
                    src: screenshotsDir + '/**/*.png',
                    dest: '<%= env.casperjs.ENVIRONMENT.toUpperCase() %>/screenshots/',
                    rel : screenshotsDir
                }]
            }
        },

        // Clean stuff up
        clean: {
            staticTarget: [staticTargetDir],
            js: [staticTargetDir + 'javascripts'],
            css: [staticTargetDir + 'stylesheets'],
            images: [staticTargetDir + 'images'],
            flash: [staticTargetDir + 'flash'],
            fonts: [staticTargetDir + 'fonts'],
            // Clean any pre-commit hooks in .git/hooks directory
            hooks: ['.git/hooks/pre-commit'],
            assets: ['common/conf/assets'],
            screenshots: [screenshotsDir]
        },

        // Recompile on change
        watch: {
            js: {
                files: ['common/app/{assets, public}/javascripts/**/*.js'],
                tasks: ['compile:js'],
                options: {
                    spawn: false
                }
            },
            css: {
                files: ['common/app/assets/stylesheets/**/*.scss'],
                tasks: ['compile:css'],
                options: {
                    spawn: false
                }
            },
            images: {
                files: ['common/app/{assets, public}/images/**/*'],
                tasks: ['compile:images']
            },
            flash: {
                files: ['common/app/public/flash/**/*'],
                tasks: ['compile:flash']
            },
            fonts: {
                files: ['resources/fonts/**/*'],
                tasks: ['compile:fonts']
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-css-metrics');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-webfontjson');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-casperjs');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-s3');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-hash');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');


    grunt.registerTask('default', ['compile', 'test', 'analyse']);

    // Compile tasks
    grunt.registerTask('compile:images', ['clean:images', 'copy:images', 'shell:spriteGeneration', 'imagemin']);
    grunt.registerTask('compile:css', ['clean:css', 'sass:compile']);
    grunt.registerTask('compile:js', function() {
        grunt.task.run(['clean:js', 'copy:js']);
        if (!isDev) {
            grunt.task.run('uglify:vendor');
        }
        grunt.task.run('requirejs:compile');
    });
    grunt.registerTask('compile:fonts', ['clean:fonts', 'mkdir:fontsTarget', 'webfontjson']);
    grunt.registerTask('compile:flash', ['clean:flash', 'copy:flash']);
    grunt.registerTask('compile', function() {
        grunt.task.run(['clean:staticTarget', 'compile:images', 'compile:css', 'compile:js', 'compile:fonts', 'compile:flash']);
        if (!isDev) {
            grunt.task.run(['clean:assets', 'copy:headCss', 'hash']);
        }
    });

    // Test tasks
    grunt.registerTask('test:integration', function(app) {
        app = app || 'allexceptadmin';
        grunt.config('casperjsLogFile', app + '.xml');
        grunt.task.run(['env:casperjs', 'casperjs:' + app]);
    });
    grunt.registerTask('test:unit', function(app) {
        grunt.task.run(['jasmine' + (app ? ':' + app : '')]);
    });
    grunt.registerTask('test', ['jshint:common', 'test:unit', 'test:integration']);
    grunt.registerTask('runner', function(app) {
        var runner = 'continuous';
        if (isDev) {
            runner = app ? app : 'dev';
        }
        grunt.task.run('karma:' + runner);
    });

    // Analyse tasks
    grunt.registerTask('analyse:css', ['compile:css', 'cssmetrics:common']);
    grunt.registerTask('analyse', ['analyse:css']);

    // Miscellaneous task
    grunt.registerTask('hookmeup', ['clean:hooks', 'shell:copyHooks']);
    grunt.registerTask('snap', ['clean:screenshots', 'mkdir:screenshots', 'env:casperjs', 'casperjs:screenshot', 's3:screenshots']);
};

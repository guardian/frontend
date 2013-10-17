/* global module: false */
module.exports = function (grunt) {
    var isDev = grunt.option('dev') || process.env.GRUNT_ISDEV === '1',
        jasmineSpec = grunt.option('spec') || '*',
        env = grunt.option('env') || 'code',
        screenshotsDir = './screenshots',
        timestampDir = require('moment')().format('YYYY/MM/DD/HH:mm:ss/');

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
                files: {
                    // head css must go where Play can find it from resources at runtime,
                    // Everything else goes into frontend-static bundling.
                    'common/conf/assets/head.min.css': 'common/app/assets/stylesheets/head.scss',
                    'common/conf/assets/head.identity.min.css': 'common/app/assets/stylesheets/head.identity.scss',
                    'static/target/compiled/stylesheets/global.min.css': 'common/app/assets/stylesheets/global.scss',
                    'static/target/compiled/stylesheets/facia.min.css': 'common/app/assets/stylesheets/facia.scss',
                    'static/target/compiled/stylesheets/football.min.css': 'common/app/assets/stylesheets/football.scss',
                    'static/target/compiled/stylesheets/gallery.min.css': 'common/app/assets/stylesheets/gallery.scss',
                    'static/target/compiled/stylesheets/video.min.css': 'common/app/assets/stylesheets/video.scss',
                    'static/target/compiled/stylesheets/old-ie.head.min.css': 'common/app/assets/stylesheets/old-ie.head.scss',
                    'static/target/compiled/stylesheets/old-ie.head.identity.min.css': 'common/app/assets/stylesheets/old-ie.head.identity.scss',
                    'static/target/compiled/stylesheets/old-ie.global.min.css': 'common/app/assets/stylesheets/old-ie.global.scss',
                    'static/target/compiled/stylesheets/webfonts.min.css': 'common/app/assets/stylesheets/webfonts.scss'
                },

                options: {
                    check: false,
                    quiet: true,
                    noCache: (isDev) ? false : true,
                    debugInfo: (isDev) ? true : false,
                    style: (isDev) ? 'nested' : 'compressed',
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
                    out: "static/target/compiled/javascripts/bootstraps/app.js",
                    paths: {
                        "bean": "components/bean/bean",
                        "bonzo": "components/bonzo/src/bonzo",
                        "domReady": "components/domready/ready",
                        "EventEmitter": "components/eventEmitter/EventEmitter",
                        "qwery": "components/qwery/mobile/qwery-mobile",
                        "reqwest": "components/reqwest/src/reqwest",
                        "domwrite": "components/dom-write/dom-write",
                        "swipe": "components/swipe/swipe",
                        "swipeview": "components/swipeview/src/swipeview"
                    },
                    "wrap" : {
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
                    "filename": "static/target/compiled/fonts/WebAgateSans.woff.js",
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
                    "filename": "static/target/compiled/fonts/WebAgateSans.ttf.js",
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
                    "filename": "static/target/compiled/fonts/WebEgyptian.woff.js",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "EgyptianText",
                            "file": "resources/fonts/EgyptianText-Regular.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-weight": "700",
                            "file": "resources/fonts/EgyptianText-Medium.woff",
                            "format": "woff"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-style": "italic",
                            "file": "resources/fonts/EgyptianText-RegularItalic.woff",
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
                    "filename": "static/target/compiled/fonts/WebEgyptian.ttf.js",
                    "callback": "guFont",
                    "fonts": [
                        {
                            "font-family": "AgateSans",
                            "file": "resources/fonts/AgateSans-Regular.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianText",
                            "file": "resources/fonts/EgyptianText-Regular.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-weight": "700",
                            "file": "resources/fonts/EgyptianText-Medium.ttf",
                            "format": "ttf"
                        },
                        {
                            "font-family": "EgyptianText",
                            "font-style": "italic",
                            "file": "resources/fonts/EgyptianText-RegularItalic.ttf",
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
            // grunt-mkdir wouldn't do what it was told for this
            webfontjson: {
                command: 'mkdir -p static/target/compiled/fonts',

                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true
                }
            },

            icons: {
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

            // Should be later in file but can't separate shell task definition
            hooks: {
                // Copy the project's pre-commit hook into .git/hooks
                command: 'cp git-hooks/pre-commit .git/hooks/',

                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: false
                }
            }

        },

        imagemin: {
            compile: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/images/',
                    src: ['**/*.png'],
                    dest: 'static/target/compiled/images/'
                },{
                    expand: true,
                    cwd: 'static/target/generated/images/',
                    src: ['**/*.{png,gif,jpg}'],
                    dest: 'static/target/compiled/images/'
                },{
                    expand: true,
                    cwd: 'common/app/public/images/',
                    src: ['**/*.{png,gif,jpg}', '!favicons/windows_tile_144_b.png'],
                    dest: 'static/target/compiled/images/'
                }]
            }
        },

        copy: {
            compile: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/images/',
                    src: ['**/*.png'],
                    dest: 'static/target/compiled/images/'
                },{
                    expand: true,
                    cwd: 'static/target/generated/images/',
                    src: ['**/*.{png,gif,jpg}'],
                    dest: 'static/target/compiled/images/'
                },{
                    expand: true,
                    cwd: 'common/app/assets/images',
                    src: ['**/*.ico'],
                    dest: 'static/target/compiled/images'
                },{
                    expand: true,
                    cwd: 'common/app/public/',
                    src: ['**/*'],
                    dest: 'static/target/compiled/'
                }]
            }
        },

        hash: {
            options: {
                // assets.map must go where Play can find it from resources at runtime.
                // Everything else goes into frontend-static bundling.
                mapping: 'common/conf/assets/assets.map',
                srcBasePath: 'static/target/compiled',
                destBasePath: 'static/target/hashed',
                flatten: false,
                hashLength: 32
            },

            files: {
                expand: true,
                cwd: 'static/target/compiled/',
                src: '**/*',
                filter: 'isFile',
                dest: 'static/target/hashed/'
            }
        },


        /***********************************************************************
         * Test
         **********************************************************************/

        jasmine: {
            options: {
                template: require('grunt-template-jasmine-requirejs'),
                keepRunner: true
            },
            common: {
                options: {
                    specs: grunt.file.expand(
                         'common/test/assets/javascripts/spec/*.js',[
                        '!common/test/assets/javascripts/spec/Autoupdate.spec.js',
                        '!common/test/assets/javascripts/spec/DocumentWrite.spec.js',
                        '!common/test/assets/javascripts/spec/Fonts.spec.js',
                        '!common/test/assets/javascripts/spec/FootballFixtures.spec.js',
                        '!common/test/assets/javascripts/spec/FootballTables.spec.js',
                        '!common/test/assets/javascripts/spec/Gallery.spec.js',
                        '!common/test/assets/javascripts/spec/GallerySwipe.spec.js',
                        '!common/test/assets/javascripts/spec/LightboxGallery.spec.js',
                        '!common/test/assets/javascripts/spec/MatchNav.spec.js',
                        '!common/test/assets/javascripts/spec/MoreMatches.spec.js',
                        '!common/test/assets/javascripts/spec/OmnitureLib.spec.js',
                        '!common/test/assets/javascripts/spec/Popular.spec.js',
                        '!common/test/assets/javascripts/spec/ProfileNav.spec.js',
                        '!common/test/assets/javascripts/spec/Related.spec.js',
                        '!common/test/assets/javascripts/spec/TopStories.spec.js',
                        '!common/test/assets/javascripts/spec/TrailblockShowMore.spec.js'
                        ]),
                    vendor: [
                        'common/test/assets/javascripts/components/sinon/lib/sinon.js',
                        'common/test/assets/javascripts/components/sinon/lib/sinon/spy.js',
                        'common/test/assets/javascripts/components/sinon/lib/sinon/stub.js',
                        'common/test/assets/javascripts/components/sinon/lib/sinon/util/*.js',
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
                                omniture:     '../../../app/public/javascripts/vendor/omniture',
                                fixtures:     '../../../test/assets/javascripts/fixtures',
                                helpers:      '../../../test/assets/javascripts/helpers'
                            }
                        }
                    }
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
            common: [
                'common/app/assets/javascripts/bootstraps/*.js',
                'common/app/assets/javascripts/modules/*.js',
                'common/app/assets/javascripts/modules/**/*.js'
            ]
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

        casperjs: {
            options: {
                // Pre-prod environments have self-signed SSL certs
                ignoreSslErrors: 'yes',
                includes: ['integration-tests/casper/tests/shared.js'],
                xunit: 'integration-tests/target/casper/',
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
            article: {
                src: [

                ]
            },
            applications: {
                src: [
                    'integration-tests/casper/tests/applications/*.spec.js'
                ]
            },
            front: {
                src: ['integration-tests/casper/tests/front/*.js']
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
                src: ['static/target/compiled/stylesheets/*.min.css'],
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
                create: [screenshotsDir]
            }
        },

        s3: {
            options: {
                bucket: 'aws-frontend-store',
                access: 'public-read'
            },
            upload: {
                upload: [{
                    src: screenshotsDir + '/*.png',
                    dest: env.toUpperCase() + '/screenshots/' + timestampDir
                }]
            }
        },

        // Clean stuff up
        clean: {
            compile: [
                'static/target',
                'common/conf/assets/head.min.css',
                'common/conf/assets/head.identity.min.css',
                'common/conf/assets/assets.map'
            ],

            // Clean any pre-commit hooks in .git/hooks directory
            hooks: ['.git/hooks/pre-commit']
        },

        // Recompile on change
        watch: {
            js: {
                files: ['common/**/*.js'],
                tasks: ['requirejs:compile', 'hash'],
                options: {
                    spawn: false
                }
            },
            sass: {
                files: ['common/**/*.scss'],
                tasks: ['sass:compile', 'hash'],
                options: {
                    spawn: false
                }
            },
            icons: {
                files: ['common/app/assets/images/**/*'],
                tasks: ['imagemin:compile', 'copy:compile', 'hash']
            }
        }
    });

    // Load the plugins
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
    grunt.loadNpmTasks('grunt-hash');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.registerTask('default', ['compile', 'test', 'analyse']);

    // Compile tasks
    grunt.registerTask('compile', [
        'sass:compile',
        'requirejs:compile',
        'shell:webfontjson',
        'webfontjson',
        'shell:icons',
        'copy:compile',
        'hash'
    ]);

    // Test tasks
    grunt.registerTask('test:integration', ['test:integration:allexceptadmin']); // ...until Facia fix the admin tests they broke.

    grunt.registerTask('test:integration:all', ['env:casperjs', 'casperjs:all']);
    grunt.registerTask('test:integration:allexceptadmin', ['env:casperjs', 'casperjs:allexceptadmin']);

    grunt.registerTask('test:integration:admin', ['env:casperjs', 'casperjs:admin']);
    grunt.registerTask('test:integration:discussion', ['env:casperjs', 'casperjs:discussion']);
    grunt.registerTask('test:integration:article', ['env:casperjs', 'casperjs:article']);
    grunt.registerTask('test:integration:front', ['env:casperjs', 'casperjs:front']);
    grunt.registerTask('test:integration:corenavigation', ['env:casperjs', 'casperjs:corenavigation']);

    grunt.registerTask('test', ['compile', 'jshint:common', 'jasmine', 'test:integration']);

    // Analyse tasks
    grunt.registerTask('analyse', ['compile', 'cssmetrics:common']);
    grunt.registerTask('analyse:common:css', ['sass:compile', 'cssmetrics:common']);

    // Miscellaneous task
    grunt.registerTask('hookmeup', ['clean:hooks', 'shell:hooks']);
    grunt.registerTask('snap', ['env:casperjs', 'clean', 'mkdir:screenshots', 'casperjs:screenshot', 's3:upload']);
};

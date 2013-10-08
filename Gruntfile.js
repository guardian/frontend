/* global module: false */
module.exports = function (grunt) {
    var isDev = (grunt.option('dev')) || process.env.GRUNT_ISDEV === '1',
        jasmineSpec = grunt.option('spec') || '*';
     var env = grunt.option('env') || 'code',
        screenshotsDir = './screenshots',
        timestampDir = require('moment')().format('YYYY/MM/DD/HH:mm:ss/');
    if (isDev) {
        grunt.log.subhead('Running Grunt in DEV mode');
    }

    // Project configuration.
    grunt.initConfig({
        sass: {
            common: {
                files: {
                    'common/app/assets/stylesheets/head.min.css': 'common/app/assets/stylesheets/head.scss',
                    'common/app/assets/stylesheets/global.min.css': 'common/app/assets/stylesheets/global.scss',
                    'common/app/assets/stylesheets/facia.min.css': 'common/app/assets/stylesheets/facia.scss',
                    'common/app/assets/stylesheets/football.min.css': 'common/app/assets/stylesheets/football.scss',
                    'common/app/assets/stylesheets/gallery.min.css': 'common/app/assets/stylesheets/gallery.scss',
                    'common/app/assets/stylesheets/video.min.css': 'common/app/assets/stylesheets/video.scss',
                    'common/app/assets/stylesheets/old-ie.head.min.css': 'common/app/assets/stylesheets/old-ie.head.scss',
                    'common/app/assets/stylesheets/old-ie.global.min.css': 'common/app/assets/stylesheets/old-ie.global.scss'
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

        cssmetrics: {
            common: {
                src: [
                    'common/app/assets/stylesheets/*.min.css'
                ],
                options: {
                    quiet: false,
                    maxRules: 4096, //IE max rules
                    maxFileSize: 1048576 //1mb in bytes
                }
            }
        },

        // Compile into single, minified Javascript files
        requirejs: {
            common: {
                options: {
                    baseUrl : "common/app/assets/javascripts",
                    name    : "bootstraps/app",
                    out     : "common/target/scala-2.10/resource_managed/main/public/javascripts/bootstraps/app.js",
                    "paths"  : {
                        "bean"                         : "components/bean/bean",
                        "bonzo"                        : "components/bonzo/src/bonzo",
                        "domReady"                     : "components/domready/ready",
                        "EventEmitter"                 : "components/eventEmitter/EventEmitter",
                        "qwery"                        : "components/qwery/mobile/qwery-mobile",
                        "reqwest"                      : "components/reqwest/src/reqwest",
                        "domwrite"                     : "components/dom-write/dom-write",
                        "swipe"                        : "components/swipe/swipe",
                        "swipeview"                    : "components/swipeview/src/swipeview",
                        // add excluded modules here, note empty scheme (note, also need to add to curl options)
                        'modules/shared-wisdom-toolbar': 'empty:'
                    },
                    "wrap" : {
                        "startFile" : "common/app/assets/javascripts/components/curl/dist/curl-with-js-and-domReady/curl.js",
                        "endFile"   : "common/app/assets/javascripts/bootstraps/go.js"
                    },
                    optimize: (isDev) ? 'none' : 'uglify2',
                    useSourceUrl:  (isDev) ? true : false,
                    "preserveLicenseComments" : false
                }
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
                src: ['integration-tests/casper/tests/article/*.spec.js']
            },
            front: {
                src: ['integration-tests/casper/tests/front/*.js']
            },
            corenavigation: {
                src: ['integration-tests/casper/tests/core-navigation/*.js']
            },
            allexceptadmin: {
                src: ['integration-tests/casper/tests/!(*admin)/*.spec.js']
            },
            },

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
                        'common/test/assets/javascripts/components/seedrandom/index.js',
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

        mkdir: {
            screenshots: {
                create: [screenshotsDir]
            }
        },
        s3: {
            options: {
                bucket: 'aws-frontend-store',
                access:'public-read'
            },
            upload: {
                upload: [{
                    src: screenshotsDir + '/*.png',
                    dest: env.toUpperCase() + '/screenshots/' + timestampDir
                }]
            }
        },

        imagemin: {
            sprite: {
                files: [{
                    'common/app/assets/images/global/sprite.png': 'common/app/assets/images/global/sprite.png'
                }]
            },

            all: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/images/',
                    src: ['**/*.png'],
                    dest: 'common/app/assets/images/'
                },{
                    expand: true,
                    cwd: 'common/app/public/images/',
                    src: ['**/*.{png,gif,jpg}'],
                    dest: 'common/app/public/images/'
                }]
            }
        },


        // Create JSON web font files from fonts.
        // Docs here: https://github.com/ahume/grunt-webfontjson
        webfontjson: {
          WebAgateSansWoff: {
              options: {
                  "filename": "common/app/public/fonts/WebAgateSans.woff.js",
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
                "filename": "common/app/public/fonts/WebAgateSans.ttf.js",
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
              "filename": "common/app/public/fonts/WebEgyptian.woff.js",
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
              "filename": "common/app/public/fonts/WebEgyptian.ttf.js",
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
        // Clean stuff up
        clean: {
          // Clean any pre-commit hooks in .git/hooks directory
          hooks: ['.git/hooks/pre-commit']
        },

        // Run shell commands
        shell: {
          hooks: {
            // Copy the project's pre-commit hook into .git/hooks
            command: 'cp git-hooks/pre-commit .git/hooks/'
          },

          icons: {
            command: [
                'cd tools/sprites/',
                'node spricon.js global-icon-config.json'
            ].join('&&')
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
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    // Standard tasks
    grunt.registerTask('test:unit', ['jasmine']);
    grunt.registerTask('test:unit:admin', ['jasmine:admin']);
    grunt.registerTask('test:unit:common', ['jasmine:common']);

    grunt.registerTask('test:integration',  ['env:casperjs', 'casperjs:all']);
    grunt.registerTask('test:integration:admin',  ['env:casperjs', 'casperjs:admin']);
    grunt.registerTask('test:integration:discussion',  ['env:casperjs', 'casperjs:discussion']);
    grunt.registerTask('test:integration:article',  ['env:casperjs', 'casperjs:article']);
    grunt.registerTask('test:integration:front',  ['env:casperjs', 'casperjs:front']);
    grunt.registerTask('test:integration:corenavigation',  ['env:casperjs', 'casperjs:corenavigation']);
    grunt.registerTask('test:integration:allexceptadmin',  ['env:casperjs', 'casperjs:allexceptadmin']);


    grunt.registerTask('test', ['jshint:common', 'test:unit', 'test:integration']);

    grunt.registerTask('compile:common:css', ['sass:common']);
    grunt.registerTask('compile:common:js', ['requirejs:common']);
    grunt.registerTask('compile', ['compile:common:css', 'compile:common:js']);

    grunt.registerTask('compile:icons', ['shell:icons', 'imagemin:sprite']);

    grunt.registerTask('analyse:common:css', ['cssmetrics:common']);
    grunt.registerTask('analyse', ['analyse:common:css']);

    grunt.registerTask('default', ['test', 'compile', 'analyse']);

    // Clean the .git/hooks/pre-commit file then copy in the latest version
    grunt.registerTask('hookmeup', ['clean:hooks', 'shell:hooks']);
    grunt.registerTask('snap', ['env:casperjs','clean', 'mkdir:screenshots', 'casperjs:screenshot', 's3:upload']);
};

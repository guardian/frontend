/* global module: false */
module.exports = function (grunt) {
    process.env['CASPERJS_EXECUTABLE'] = 'dev/casperjs/bin/casperjs';
    process.env['PHANTOMJS_EXECUTABLE'] = 'node_modules/phantomjs/bin/phantomjs';
    var isDev = (grunt.option('dev')) || process.env.GRUNT_ISDEV === '1';
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
                    'common/app/assets/stylesheets/football.min.css': 'common/app/assets/stylesheets/football.scss',
                    'common/app/assets/stylesheets/gallery.min.css': 'common/app/assets/stylesheets/gallery.scss',
                    'common/app/assets/stylesheets/story.min.css': 'common/app/assets/stylesheets/story.scss',
                    'common/app/assets/stylesheets/video.min.css': 'common/app/assets/stylesheets/video.scss',
                    'style-guide/app/assets/stylesheets/styleguide.min.css': 'style-guide/app/assets/stylesheets/styleguide.scss'
                },
                options: {
                    check: false,
                    quiet: true,
                    noCache: (isDev) ? false : true,
                    debugInfo: (isDev) ? true : false,
                    style: (isDev) ? 'nested' : 'compressed',
                    loadPath: [
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

        casper: {
          options : {
            test : true,
            direct : true,
            includes : 'integration-tests/casper/tests/shared.js',
            'log-level' : 'info',
            host: 'http://localhost:9000/'
          },           
          common : {
            src: ['integration-tests/casper/tests/*.spec.js'],
            dest : function(input) {
              var i = input.replace('/casper/tests/', '/target/casper-xunit-reports/');
              i = i.replace(/\.js$/,'.xml');
              console.log(i);
              return i;
            }
          },
          discussion: {
            src: ['integration-tests/casper/tests/discussion.spec.js'],
            dest: 'integration-tests/target/casper-xunit-reports/discussion.spec.xml'
          },
          networkfront: {
            src: ['integration-tests/casper/tests/network-front.spec.js'],
            dest: 'integration-tests/target/casper-xunit-reports/network-front.spec.xml'
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

        // Create JSON web font files from fonts.
        // Docs here: https://github.com/ahume/grunt-webfontjson
        webfontjson: {
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
                  "font-weight": "700",
                  "file": "resources/fonts/EgyptianHeadline-Medium.woff",
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
                  "font-weight": "700",
                  "file": "resources/fonts/EgyptianHeadline-Medium.ttf",
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
    grunt.loadNpmTasks('grunt-casper');

    // Standard tasks
    grunt.registerTask('test:integration', ['casper:common']);
    grunt.registerTask('test:common', ['jshint:common', 'casper:common']);
    grunt.registerTask('test', ['test:common']);

    grunt.registerTask('compile:common:css', ['sass:common']);
    grunt.registerTask('compile:common:js', ['requirejs:common']);
    grunt.registerTask('compile', ['compile:common:css', 'compile:common:js']);

    grunt.registerTask('analyse:common:css', ['cssmetrics:common']);
    grunt.registerTask('analyse', ['analyse:common:css']);

    grunt.registerTask('default', ['test', 'compile', 'analyse']);

    // Clean the .git/hooks/pre-commit file then copy in the latest version
    grunt.registerTask('hookmeup', ['clean:hooks', 'shell:hooks']);
};

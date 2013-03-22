/* global module: false */
module.exports = function (grunt) {
    // Project configuration.

    grunt.initConfig({
        sass: {
            common: {
                files: {
                    'common/app/assets/stylesheets/main.min.css': 'common/app/assets/stylesheets/main.scss'
                },
                options: {
                    check: true,
                    quiet: true,
                    loadPath: [
                        'common/app/assets/stylesheets/components/pasteup/sass/layout',
                        'common/app/assets/stylesheets/components/normalize-scss'
                    ]
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
                        "bean"         : "components/bean/bean",
                        "bonzo"        : "components/bonzo/src/bonzo",
                        "domReady"     : "components/domready/ready",
                        "EventEmitter" : "components/eventEmitter/EventEmitter",
                        "qwery"        : "components/qwery/mobile/qwery-mobile",
                        "reqwest"      : "components/reqwest/src/reqwest",
                        "domwrite"     : "components/dom-write/dom-write",
                        "swipe"        : "components/swipe/swipe"
                    },
                    "wrap" : {
                        "startFile" : "common/app/assets/javascripts/components/curl/dist/curl-with-js-and-domReady/curl.js",
                        "endFile"   : "common/app/assets/javascripts/bootstraps/go.js"
                    },
                    "optimize"  : "uglify2",
                    "preserveLicenseComments" : false
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

        // Create JSON web font files from fonts.
        // Docs here: https://github.com/ahume/grunt-webfontjson
        webfontjson: {
          woff: {
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
                  "font-weight": "500", 
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
                  "font-weight": "600",
                  "file": "resources/fonts/EgyptianHeadline-Semibold.woff",
                  "format": "woff"
                }
              ]
            }
          },
          ttf: {
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
                  "font-weight": "500", 
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
                  "font-weight": "600",
                  "file": "resources/fonts/EgyptianHeadline-Semibold.ttf",
                  "format": "ttf"
                }
              ]
            }
          },
        }

    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-webfontjson');

    // Standard tasks
    grunt.registerTask('test:common', ['jshint:common']);
    grunt.registerTask('test', ['test:common']);

    grunt.registerTask('compile:common:css', ['sass:common']);
    grunt.registerTask('compile:common:js', ['requirejs:common']);

    grunt.registerTask('compile', ['compile:common:css', 'compile:common:js']);

    grunt.registerTask('default', ['test', 'compile']);
};

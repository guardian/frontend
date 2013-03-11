/* global module: false */
module.exports = function (grunt) {
    // Project configuration.

    grunt.initConfig({
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
        webfontjson: {
          woff: {
            options: {
              "filename": "common/app/public/fonts/WebEgyptian.woff.js",
              "callback": "guFont",
              "fonts": [
                {
                  "font-family": "EgyptianText",
                  "file": "resources/fonts/latin1/EgyptianText-Regular.woff",
                  "format": "woff"
                },
                {
                  "font-family": "EgyptianText",
                  "font-weight": "500", 
                  "file": "resources/fonts/latin1/EgyptianText-Medium.woff",
                  "format": "woff"
                },
                {
                  "font-family": "EgyptianText",
                  "font-style:": "italic",
                  "file": "resources/fonts/latin1/EgyptianText-RegularItalic.woff",
                  "format": "woff"
                },
                {
                  "font-family": "EgyptianHeadline",
                  "font-weight:": "600",
                  "file": "resources/fonts/latin1/EgyptianHeadline-Semibold.woff",
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
                  "file": "resources/fonts/latin1/EgyptianText-Regular.ttf",
                  "format": "ttf"
                },
                {
                  "font-family": "EgyptianText",
                  "font-weight": "500", 
                  "file": "resources/fonts/latin1/EgyptianText-Medium.ttf",
                  "format": "ttf"
                },
                {
                  "font-family": "EgyptianText",
                  "font-style:": "italic",
                  "file": "resources/fonts/latin1/EgyptianText-RegularItalic.ttf",
                  "format": "ttf"
                },
                {
                  "font-family": "EgyptianHeadline",
                  "font-weight:": "600",
                  "file": "resources/fonts/latin1/EgyptianHeadline-Semibold.ttf",
                  "format": "ttf"
                }
              ]
            }
          },
        }

    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-webfontjson');

    // Standard tasks
    grunt.registerTask('test:common', ['jshint:common']);
    grunt.registerTask('test', ['test:common']);

    grunt.registerTask('compile:common', ['requirejs:common']);
    grunt.registerTask('compile', ['compile:common']);

    grunt.registerTask('default', ['test', 'compile']);
};
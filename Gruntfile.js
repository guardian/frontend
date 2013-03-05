module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        // Compile into single, minified Javascript files
        requirejs: {
            frontend: {
                options: {
                    baseUrl : "common/app/assets/javascripts",
                    name    : "bootstraps/app",
                    out     : -> (resources.getAbsolutePath + "/main/public/javascripts/bootstraps/app.js")) ~
//          ("paths" ->
//            ("bean"         -> "components/bean/bean") ~
//            ("bonzo"        -> "components/bonzo/src/bonzo") ~
//            ("domReady"     -> "components/domready/ready") ~
//            ("EventEmitter" -> "components/eventEmitter/EventEmitter") ~
//            ("qwery"        -> "components/qwery/mobile/qwery-mobile") ~
//            ("reqwest"      -> "components/reqwest/src/reqwest") ~
//            ("domwrite"     -> "components/dom-write/dom-write") ~
//            ("swipe"        -> "components/swipe/swipe")
//          ) ~
//          ("wrap" ->
//            ("startFile" -> (base.getAbsolutePath + "/app/assets/javascripts/components/curl/dist/curl-with-js-and-domReady/curl.js")) ~
//            ("endFile" -> (base.getAbsolutePath + "/app/assets/javascripts/bootstraps/go.js"))
//          ) ~
//          ("optimize" -> "uglify2") ~
//          ("preserveLicenseComments" -> false)
//        )
                }
            }
        },

        // Lint Javascript sources
        jshint: {
            options: require('./project/jshintOptions'),
            self: [
                'Gruntfile.js'
            ],
            frontend: [
                'flexible-content-frontend/src/main/webapp/static/js/**/*.js',
                '!flexible-content-frontend/src/main/webapp/static/js/lib/**/*.*'
            ],
            admin: [
                // Sources
                'flexible-content-admin/src/main/webapp/static/js/**/*.js',
                '!flexible-content-admin/src/main/webapp/static/js/lib/**/*.*',
                '!flexible-content-admin/src/main/webapp/static/js/lib-customisations/**/*.*',
                // Tests
                'flexible-content-admin/src/test/webapp/static/js/**/*.js',
                '!flexible-content-admin/src/test/webapp/static/js/lib/**/*.js',
                '!flexible-content-admin/src/test/webapp/static/js/mocks/**/*.js'
            ]
        },

        // Run Javascript tests
        jasmine: {
            admin: {
                // Note: we don't specify any 'src' as all required code is loaded via AMD
                options: {
                    specs: [
                        // Hack: pre-load some environment modules that are used later on
                        'flexible-content-admin/src/test/webapp/static/js/environment.js',
                        'flexible-content-admin/src/test/webapp/static/js/specs/**/*.spec.js'
                    ],
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        "requireConfig": grunt.file.readJSON('flexible-content-admin/src/test/webapp/static/js/require.conf.json')
                    }
                }
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Standard tasks
    grunt.registerTask('test:admin',    ['jshint:admin', 'jasmine:admin']);
    grunt.registerTask('test:frontend', ['jshint:frontend']);
    grunt.registerTask('test', ['test:admin', 'test:frontend']);

    grunt.registerTask('compile:admin',    ['requirejs:admin']);
    grunt.registerTask('compile:frontend', ['requirejs:frontend']);
    grunt.registerTask('compile', ['compile:admin', 'compile:frontend']);

    grunt.registerTask('default', ['test', 'compile']);

};
/* global module: false, process: false */
module.exports = function (grunt) {
    var isDev = grunt.option('dev') || process.env.GRUNT_ISDEV === '1',
        singleRun = grunt.option('single-run') !== false,
        env = grunt.option('env') || 'code',
        screenshotsDir = './screenshots',
        staticDir = 'static/',
        staticTargetDir = staticDir + 'target/',
        staticRequireDir = staticDir + 'requirejs/',
        testConfDir = 'common/test/assets/javascripts/conf/',
        propertiesFile = (isDev) ? process.env.HOME + '/.gu/frontend.properties' : '/etc/gu/frontend.properties';


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
            options: {
                baseUrl: staticRequireDir + 'javascripts',
                paths: {
                    bean:         'common/components/bean/bean',
                    bonzo:        'common/components/bonzo/src/bonzo',
                    domReady:     'common/components/domready/ready',
                    EventEmitter: 'common/components/eventEmitter/EventEmitter',
                    qwery:        'common/components/qwery/mobile/qwery-mobile',
                    reqwest:      'common/components/reqwest/src/reqwest',
                    postscribe:   'common/components/postscribe/dist/postscribe',
                    lodash:       'common/components/lodash-amd/modern',
                    imager:       'common/components/imager.js/src/strategies/container',
                    omniture:     'common/components/omniture/omniture',
                    'ophan/ng':   'empty:'
                },
                optimize: (isDev) ? 'none' : 'uglify2',
                useSourceUrl: (isDev) ? true : false,
                preserveLicenseComments: false
            },
            common: {
                options: {
                    name: 'common/bootstraps/app',
                    out: staticTargetDir + 'javascripts/bootstraps/app.js',
                    shim: {
                        postscribe: {
                            exports: 'postscribe'
                        },
                        imager: {
                            deps: ['common/components/imager.js/src/imager'],
                            exports: 'Imager'
                        },
                        omniture: {
                            exports: 's'
                        }
                    },
                    wrap: {
                        startFile: 'common/app/assets/javascripts/components/curl/dist/curl-with-js-and-domReady/curl.js',
                        endFile:   'common/app/assets/javascripts/bootstraps/go.js'
                    }
                }
            },
            admin: {
                options: {
                    name: 'bootstraps/admin',
                    out: staticTargetDir + 'javascripts/bootstraps/admin.js',
                    wrap: {
                        startFile: 'common/app/assets/javascripts/components/curl/dist/curl-with-js-and-domReady/curl.js'
                    }
                }
            },
            facia: {
                options: {
                    name: 'bootstraps/facia',
                    out: staticTargetDir + 'javascripts/bootstraps/facia.js',
                    exclude: ['common/bootstraps/app'],
                    keepBuildDir: true
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
            },

            abTestInfo: {
                command: 'node tools/ab-test-info/ab-test-info.js ' +
                         'common/app/assets/javascripts/modules/experiments/tests ' +
                         'static/abtests.json',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true
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
            'javascript-common': {
                files: [{
                    expand: true,
                    cwd: 'common/app/public/javascripts',
                    src: ['**/*.js'],
                    dest: staticTargetDir + 'javascripts'
                },
                {
                    expand: true,
                    cwd: 'common/app/assets/javascripts',
                    src: ['**/*.js'],
                    dest: staticRequireDir + 'javascripts/common'
                }]
            },
            'javascript-common-tests': {
                files: [{
                    expand: true,
                    cwd: 'common/test/assets/javascripts/spec',
                    src: ['**/*.js'],
                    dest: staticRequireDir + 'tests/specs'
                }]
            },
            'javascript-admin': {
                files: [{
                    expand: true,
                    cwd: 'admin/app/assets/javascripts',
                    src: ['**/*.js'],
                    dest: staticRequireDir + 'javascripts'
                },
                {
                    expand: true,
                    cwd: 'admin/public/javascripts',
                    src: ['**/*.js'],
                    dest: staticRequireDir + 'javascripts'
                }]
            },
            'javascript-facia': {
                files: [{
                    expand: true,
                    cwd: 'facia/app/assets/javascripts',
                    src: ['**/*.js'],
                    dest: staticRequireDir + 'javascripts'
                }]
            },
            'javascript-facia-tests': {
                files: [{
                    expand: true,
                    cwd: 'facia/test/assets/javascripts/spec',
                    src: ['**/*.js'],
                    dest: staticRequireDir + 'tests/specs'
                }]
            },
            testUtils: {
                files: [{
                    expand: true,
                    cwd: 'common/test/assets/javascripts',
                    src: ['**/*', '!spec/**'],
                    dest: staticRequireDir + 'tests'
                }]
            },
            commonModules: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/javascripts',
                    src: ['**/*.js'],
                    dest: staticRequireDir + 'javascripts/common'
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
            components: {
                files: [{
                    expand: true,
                    cwd: staticTargetDir + 'javascripts/components/',
                    src: '**/*.js',
                    dest: staticTargetDir + 'javascripts/components/'
                }]
            }
        },


        /***********************************************************************
         * Test
         **********************************************************************/

        karma: {
            options: {
                configFile: testConfDir + 'common.js',
                reporters: isDev ? ['dots'] : ['progress'],
                singleRun: singleRun
            },
            common: {
                configFile: testConfDir + 'common.js'
            },
            facia: {
                configFile: testConfDir + 'facia.js'
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
            },
            facia: {
                files: [{
                    expand: true,
                    cwd: 'facia/app/assets/javascripts/',
                    src: ['**/*.js']
                }]
            },
            faciaTool: {
                files: [{
                    expand: true,
                    cwd: 'facia-tool/public/javascripts/',
                    src: ['**/*.js', '!components/**', '!omniture.js']
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
            allexceptadmin: {
                src: ['integration-tests/casper/tests/!(*admin)/*.spec.js']
            },
            admin: {
                src: ['integration-tests/casper/tests/admin/*.spec.js']
            },
            applications: {
                src: ['integration-tests/casper/tests/applications/*.spec.js']
            },
            common : {
                src: ['integration-tests/casper/tests/common/*.spec.js']
            },
            discussion: {
                src: ['integration-tests/casper/tests/discussion/*.spec.js']
            },
            facia: {
                src: ['integration-tests/casper/tests/facia/*.spec.js']
            },
            identity: {
                src: ['integration-tests/casper/tests/identity/*.spec.js']
            },
            open: {
                src: ['integration-tests/casper/tests/open/*.spec.js']
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
        assetmonitor: {
            common: {
                src: [
                    staticTargetDir + 'javascripts/bootstraps/app.js',
                    staticTargetDir + 'stylesheets/head.default.css',
                    staticTargetDir + 'stylesheets/head.facia.css',
                    staticTargetDir + 'stylesheets/global.css'
                ],
                options: {
                    credentials: propertiesFile
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
                //encodePaths: true,
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
            'static': [staticDir],
            staticTarget: [staticTargetDir],
            js: [staticTargetDir + 'javascripts', staticRequireDir],
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
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-hash');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-asset-monitor');

    grunt.registerTask('default', ['compile', 'test', 'analyse']);

    grunt.registerTask('validate', function(app) {
        if (!app) {
            grunt.task.run('jshint');
        } else {
            // jsihnt target exist?
            if (grunt.config('jshint')[app]) {
                grunt.task.run('jshint:' + app);
            }
        }
    });

    // Compile tasks
    grunt.registerTask('compile:images', ['clean:images', 'copy:images', 'shell:spriteGeneration', 'imagemin']);
    grunt.registerTask('compile:css', ['clean:css', 'sass:compile']);
    grunt.registerTask('compile:js', function(app) {
        grunt.task.run(['clean:js', 'copy:javascript-common']);
        if (app && grunt.config('copy')['javascript-' + app]) {
            grunt.task.run('copy:javascript-' + app);
        }
        if (!isDev) {
            grunt.task.run('uglify:components');
        }
        grunt.task.run('requirejs:common');
        // When an app defines it's own javascript application, the requirejs task will need to compile both
        // common and app.
        if (grunt.config('requirejs')[app]) {
            grunt.task.run('requirejs:' + app);
        }
    });
    grunt.registerTask('compile:fonts', ['clean:fonts', 'mkdir:fontsTarget', 'webfontjson']);
    grunt.registerTask('compile:flash', ['clean:flash', 'copy:flash']);
    grunt.registerTask('compile', function(app) {
        grunt.task.run(['clean:staticTarget', 'compile:images', 'compile:css', 'compile:js' + (app ? ':' + app : ''), 'compile:fonts', 'compile:flash']);
        if (!isDev) {
            grunt.task.run(['clean:assets', 'copy:headCss', 'hash']);
        }
    });

    // Test tasks
    grunt.registerTask('test:integration', function(app) {
        if (!app) {
            grunt.fail.fatal('No app specified.');
        }
        // does a casperjs setup exist for this app
        grunt.config.requires(['casperjs', app]);
        grunt.config('casperjsLogFile', app + '.xml');
        grunt.task.run(['env:casperjs', 'casperjs:' + app]);
    });
    grunt.registerTask('test:unit', function(app) {
        var apps = [];
        // have we supplied an app
        if (app) {
            // does a karma setup exist for this app
            if (!grunt.config('karma')[app]) {
                grunt.log.warn('No tests for app "' + app + '"');
                return true;
            }
            apps = [app];
        } else { // otherwise run all
            apps = Object.keys(grunt.config('karma')).filter(function(app) { return app !== 'options'; });
        }
        grunt.config.set('karma.options.singleRun', (singleRun === false) ? false : true);
        apps.forEach(function(app) {
            grunt.task.run(['clean:static', 'copy:testUtils', 'copy:commonModules', 'copy:javascript-' + app, 'copy:javascript-' + app + '-tests', 'karma:' + app]);
        });
    });
    // TODO - don't have common as default?
    grunt.registerTask('test', ['jshint:common', 'test:unit:common', 'test:integration:common']);

    // Analyse tasks
    grunt.registerTask('analyse:css', ['compile:css', 'cssmetrics:common']);
    grunt.registerTask('analyse:monitor', ['monitor:common']);
    grunt.registerTask('analyse', ['analyse:css']);

    // Miscellaneous task
    grunt.registerTask('hookmeup', ['clean:hooks', 'shell:copyHooks']);
    grunt.registerTask('snap', ['clean:screenshots', 'mkdir:screenshots', 'env:casperjs', 'casperjs:screenshot', 's3:screenshots']);
    grunt.registerTask('emitAbTestInfo', ['shell:abTestInfo']);
};

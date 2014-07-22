/* global module: false, process: false */
var pngquant = require('imagemin-pngquant');

module.exports = function (grunt) {

    var isDev = (grunt.option('dev') !== undefined) ? Boolean(grunt.option('dev')) : process.env.GRUNT_ISDEV === '1',
        singleRun = grunt.option('single-run') !== false,
        staticTargetDir = './static/target/',
        staticHashDir = './static/hash/',
        testConfDir = './common/test/assets/javascripts/conf/',
        requirejsDir = './static/requirejs',
        propertiesFile = (isDev) ? process.env.HOME + '/.gu/frontend.properties' : '/etc/gu/frontend.properties',
        webfontsDir = './common/app/assets/stylesheets/components/guss-webfonts/webfonts/';

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
                    style: 'compressed',
                    sourcemap: true,
                    noCache: true,
                    quiet: (isDev) ? false : true
                }
            }
        },

        requirejs: {
            options: {
                paths: {
                    common:       '../../../../common/app/assets/javascripts',
                    bean:         '../../../../common/app/assets/javascripts/components/bean/bean',
                    bonzo:        '../../../../common/app/assets/javascripts/components/bonzo/bonzo',
                    domReady:     '../../../../common/app/assets/javascripts/components/domready/ready',
                    EventEmitter: '../../../../common/app/assets/javascripts/components/eventEmitter/EventEmitter',
                    qwery:        '../../../../common/app/assets/javascripts/components/qwery/qwery-mobile',
                    reqwest:      '../../../../common/app/assets/javascripts/components/reqwest/reqwest',
                    lodash:       '../../../../common/app/assets/javascripts/components/lodash-amd',
                    imager:       '../../../../common/app/assets/javascripts/components/imager.js/container',
                    omniture:     '../../../../common/app/assets/javascripts/components/omniture/omniture',
                    fence:        '../../../../common/app/assets/javascripts/components/fence/fence',
                    enhancer:     '../../../../common/app/assets/javascripts/components/enhancer/enhancer',
                    stripe:       '../../../../common/app/assets/javascripts/components/stripe/stripe.min',
                    raven:        '../../../../common/app/assets/javascripts/components/raven-js/raven'
                },
                optimize: 'uglify2',
                generateSourceMaps: true,
                preserveLicenseComments: false,
                fileExclusionRegExp: /^bower_components$/
            },
            common: {
                options: {
                    baseUrl: 'common/app/assets/javascripts',
                    dir: requirejsDir,
                    keepBuildDir: false,
                    shim: {
                        imager: {
                            deps: ['components/imager.js/imager'],
                            exports: 'Imager'
                        },
                        omniture: {
                            exports: 's'
                        }
                    },
                    modules: [
                        {
                            name: 'core'
                        },
                        {
                            name: 'bootstraps/app',
                            exclude: ['core']
                        },
                        {
                            name: 'bootstraps/commercial',
                            exclude: ['core']
                        }
                    ]
                }
            },
            facia: {
                options: {
                    baseUrl: 'facia/app/assets/javascripts',
                    name: 'bootstraps/facia',
                    out: staticTargetDir + 'javascripts/bootstraps/facia.js',
                    exclude: [
                        '../../../../common/app/assets/javascripts/core',
                        '../../../../common/app/assets/javascripts/bootstraps/app'
                    ]
                }
            },
            identity: {
                options: {
                    baseUrl: 'identity/app/assets/javascripts',
                    name: 'bootstraps/membership',
                    out: staticTargetDir + 'javascripts/bootstraps/membership.js',
                    exclude: [
                        '../../../../common/app/assets/javascripts/core',
                        '../../../../common/app/assets/javascripts/bootstraps/app'
                    ]
                }
            },
            ophan: {
                options: {
                    baseUrl: 'common/app/assets/javascripts',
                    name: 'common/bootstraps/ophan',
                    out: staticTargetDir + 'javascripts/bootstraps/ophan.js'
                }
            },
            admin: {
                options: {
                    baseUrl: 'admin/app/assets/javascripts',
                    name: 'bootstraps/admin',
                    out: staticTargetDir + 'javascripts/bootstraps/admin.js',
                    shim: {
                        imager: {
                            deps: ['common/components/imager.js/imager'],
                            exports: 'Imager'
                        },
                        omniture: {
                            exports: 's'
                        }
                    }
                }
            },
            video : {
                options: {
                    baseUrl: 'common/app/assets/javascripts',
                    name: 'bootstraps/video-player',
                    out: staticTargetDir + 'javascripts/bootstraps/video-player.js',
                    paths: {
                        vast: '../../../../common/app/public/javascripts/vendor/vast-client',
                        videojs: 'components/videojs/video',
                        videojsads: 'components/videojs-contrib-ads/videojs.ads',
                        videojsvast: 'components/videojs-vast/videojs.vast',
                        videojspersistvolume: 'components/videojs-persistvolume/videojs.persistvolume'
                    },
                    shim: {
                        vast: {
                            exports: 'DMVAST'
                        },
                        videojs: {
                            exports: 'videojs'
                        },
                        videojsads: {
                            deps: ['videojs']
                        },
                        videojsvast :{
                             deps: ['vast', 'videojs']
                        }
                    },
                    wrapShim: true,
                    optimize: 'none',
                    generateSourceMaps: true,
                    preserveLicenseComments: false
                }
            },
            dev: {
                options: {
                    baseUrl: 'common/app/assets/javascripts',
                    name: 'bootstraps/dev',
                    out: staticTargetDir + 'javascripts/bootstraps/dev.js',
                    paths: {
                        socketio: 'components/socket.io-client/socket.io'
                    }
                },
                exclude: ['core','bootstraps/app']
            }
        },

        // Create JSON web font files from fonts. See https://github.com/ahume/grunt-webfontjson
        webfontjson: {
            GuardianAgateSans1WebWoff: {
                options: {
                    filename: staticTargetDir + 'fonts/GuardianAgateSans1Web.woff.json',
                    callback: 'guFont',
                    fonts: [
                        {
                            'font-family': 'Guardian Agate Sans 1 Web',
                            file: webfontsDir + 'hinting-off-ascii/GuardianAgateSans1Web/GuardianAgateSans1Web-Regular.woff',
                            format: 'woff'
                        },
                        {
                            'font-family': 'Guardian Agate Sans 1 Web',
                            'font-weight': '700',
                            file: webfontsDir + 'hinting-off-ascii/GuardianAgateSans1Web/GuardianAgateSans1Web-Bold.woff',
                            format: 'woff'
                        }
                    ]
                }
            },
            GuardianAgateSans1WebTtf: {
                options: {
                    filename: staticTargetDir + 'fonts/GuardianAgateSans1Web.ttf.json',
                    callback: 'guFont',
                    fonts: [
                        {
                            'font-family': 'AgateSans',
                            file: webfontsDir + 'hinting-off-ascii/GuardianAgateSans1Web/GuardianAgateSans1Web-Regular.ttf',
                            format: 'ttf'
                        },
                        {
                            'font-family': 'Guardian Agate Sans 1 Web',
                            'font-weight': '700',
                            file: webfontsDir + 'hinting-off-ascii/GuardianAgateSans1Web/GuardianAgateSans1Web-Bold.ttf',
                            format: 'ttf'
                        }
                    ]
                }
            },
            GuardianEgyptianWebWoff: {
                options: {
                    filename: staticTargetDir + 'fonts/GuardianEgyptianWeb.woff.json',
                    callback: 'guFont',
                    fonts: [
                        {
                            'font-family': 'Guardian Text Egyptian Web',
                            file: webfontsDir + 'hinting-off-latin1/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Regular.woff',
                            format: 'woff'
                        },
                        {
                            'font-family': 'Guardian Text Egyptian Web',
                            'font-style': 'italic',
                            file: webfontsDir + 'hinting-off-ascii/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-RegularItalic.woff',
                            format: 'woff'
                        },
                        {
                            'font-family': 'Guardian Text Egyptian Web',
                            'font-weight': '700',
                            file: webfontsDir + 'hinting-off-ascii/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Medium.woff',
                            format: 'woff'
                        },
                        {
                            'font-family': 'Guardian Egyptian Web',
                            'font-weight': '200',
                            file: webfontsDir + 'hinting-off-ascii/GuardianEgyptianWeb/GuardianEgyptianWeb-Light.woff',
                            format: 'woff'
                        },
                        {
                            'font-family': 'Guardian Egyptian Web',
                            'font-weight': '400',
                            file: webfontsDir + 'hinting-off-ascii/GuardianEgyptianWeb/GuardianEgyptianWeb-Regular.woff',
                            format: 'woff'
                        },
                        // This weight contains only a certain set of chars
                        // since it is used only in one place (section names)
                        {
                            'font-family': 'Guardian Egyptian Web',
                            'font-weight': '900',
                            file: webfontsDir + 'hinting-off-ascii/GuardianEgyptianWeb/GuardianEgyptianWeb-Semibold.woff',
                            format: 'woff'
                        }
                    ]
                }
            },
            GuardianEgyptianWebTtf: {
                options: {
                    filename: staticTargetDir + 'fonts/GuardianEgyptianWeb.ttf.json',
                    callback: 'guFont',
                    fonts: [
                        {
                            'font-family': 'Guardian Text Egyptian Web',
                            file: webfontsDir + 'hinting-off-latin1/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Regular.ttf',
                            format: 'ttf'
                        },
                        {
                            'font-family': 'Guardian Text Egyptian Web',
                            'font-style': 'italic',
                            file: webfontsDir + 'hinting-off-ascii/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-RegularItalic.ttf',
                            format: 'ttf'
                        },
                        {
                            'font-family': 'Guardian Text Egyptian Web',
                            'font-weight': '700',
                            file: webfontsDir + 'hinting-off-ascii/GuardianTextEgyptianWeb/GuardianTextEgyptianWeb-Medium.ttf',
                            format: 'ttf'
                        },
                        {
                            'font-family': 'Guardian Egyptian Web',
                            'font-weight': '200',
                            file: webfontsDir + 'hinting-off-ascii/GuardianEgyptianWeb/GuardianEgyptianWeb-Light.ttf',
                            format: 'ttf'
                        },
                        {
                            'font-family': 'Guardian Egyptian Web',
                            'font-weight': '400',
                            file: webfontsDir + 'hinting-off-ascii/GuardianEgyptianWeb/GuardianEgyptianWeb-Regular.ttf',
                            format: 'ttf'
                        },
                        // This weight contains only a certain set of chars
                        // since it is used only in one place (section names)
                        {
                            'font-family': 'Guardian Egyptian Web',
                            'font-weight': '900',
                            file: webfontsDir + 'hinting-off-ascii/GuardianEgyptianWeb/GuardianEgyptianWeb-Semibold.ttf',
                            format: 'ttf'
                        }
                    ]
                }
            },
            GuardianTextSansWebWoff: {
                options: {
                    filename: staticTargetDir + 'fonts/GuardianTextSansWeb.woff.json',
                    callback: 'guFont',
                    fonts: [
                        {
                            'font-family': 'Guardian Text Sans Web',
                            file: webfontsDir + 'hinting-off-original/GuardianTextSansWeb/GuardianTextSansWeb-Regular.woff',
                            format: 'woff'
                        },
                        {
                            'font-family': 'Guardian Text Sans Web',
                            'font-style': 'italic',
                            file: webfontsDir + 'hinting-off-ascii/GuardianTextSansWeb/GuardianTextSansWeb-RegularItalic.woff',
                            format: 'woff'
                        },
                        {
                            'font-family': 'Guardian Text Sans Web',
                            'font-weight': '700',
                            file: webfontsDir + 'hinting-off-original/GuardianTextSansWeb/GuardianTextSansWeb-Medium.woff',
                            format: 'woff'
                        }
                    ]
                }
            },
            GuardianTextSansWebTtf: {
                options: {
                    filename: staticTargetDir + 'fonts/GuardianTextSansWeb.ttf.json',
                    callback: 'guFont',
                    fonts: [
                        {
                            'font-family': 'Guardian Text Sans Web',
                            file: webfontsDir + 'hinting-off-original/GuardianTextSansWeb/GuardianTextSansWeb-Regular.ttf',
                            format: 'ttf'
                        },
                        {
                            'font-family': 'Guardian Text Sans Web',
                            'font-style': 'italic',
                            file: webfontsDir + 'hinting-off-ascii/GuardianTextSansWeb/GuardianTextSansWeb-RegularItalic.ttf',
                            format: 'ttf'
                        },
                        {
                            'font-family': 'Guardian Text Sans Web',
                            'font-weight': '700',
                            file: webfontsDir + 'hinting-off-original/GuardianTextSansWeb/GuardianTextSansWeb-Medium.ttf',
                            format: 'ttf'
                        }
                    ]
                }
            },
            GuardianSansWebWoff: {
                options: {
                    filename: staticTargetDir + 'fonts/GuardianSansWeb.woff.json',
                    callback: 'guFont',
                    fonts: [
                        {
                            'font-family': 'Guardian Sans Web',
                            file: webfontsDir + 'hinting-off-ascii/GuardianSansWeb/GuardianSansWeb-Light.woff',
                            'font-weight': '200',
                            format: 'woff'
                        }
                    ]
                }
            },
            GuardianSansWebTtf: {
                options: {
                    filename: staticTargetDir + 'fonts/GuardianSansWeb.ttf.json',
                    callback: 'guFont',
                    fonts: [
                        {
                            'font-family': 'Guardian Sans Web',
                            file: webfontsDir + 'hinting-off-ascii/GuardianSansWeb/GuardianSansWeb-Light.ttf',
                            'font-weight': '200',
                            format: 'ttf'
                        }
                    ]
                }
            }
        },

        shell: {
            spriteGeneration: {
                command: [
                    'cd tools/sprites/',
                    'find . -name \'*.json\' -exec node spricon.js {} \\;'
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
            options: {
                optimizationLevel: 2,
                use: [pngquant()]
            },
            files: {
                expand: true,
                cwd: staticTargetDir + 'images/',
                src: ['**/*.{png,gif,jpg}', '!favicons/windows_tile_144_b.png'],
                dest: staticTargetDir + 'images'
            }
        },

        copy: {
            'javascript': {
                files: [
                    {
                        expand: true,
                        cwd: 'common/app/public/javascripts/components',
                        src: ['**/*.js'],
                        dest: staticTargetDir + 'javascripts/components'
                    },
                    {
                        expand: true,
                        cwd: 'common/app/public/javascripts/vendor',
                        src: [
                            'foresee*/foresee-trigger.js',
                            'formstack-interactive/0.1/boot.js',
                            'vast-client.js'
                        ],
                        dest: staticTargetDir + 'javascripts/vendor'
                    },
                    {
                        expand: true,
                        cwd: 'common/app/public/javascripts/vendor',
                        src: [
                            'foresee*/**'
                        ],
                        dest: staticHashDir + 'javascripts/vendor'
                    },
                    {
                        expand: true,
                        cwd: requirejsDir,
                        src: [
                            'core.js',
                            'core.js.map',
                            'bootstraps/app.js',
                            'bootstraps/app.js.map',
                            'bootstraps/commercial.js',
                            'bootstraps/commercial.js.map',
                            'components/curl/curl-domReady.js'
                        ],
                        dest: staticTargetDir + 'javascripts'
                    }
                ]
            },
            css: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/stylesheets',
                    src: ['**/*.scss'],
                    dest: staticTargetDir + 'stylesheets'
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
                    cwd: staticTargetDir + 'stylesheets',
                    src: ['**/head*.css'],
                    dest: 'common/conf/assets'
                }]
            },
            headJs: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/javascripts/components/curl',
                    src: ['curl-domReady.js'],
                    dest: 'common/conf/assets'
                }]
            },
            // assets.map must go where Play can find it from resources at runtime.
            // Everything else goes into frontend-static bundling.
            assetMap: {
                files: [{
                    expand: true,
                    cwd: staticHashDir + 'assets',
                    src: ['**/assets.map'],
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

        asset_hash: {
            options: {
                assetMap: staticHashDir + 'assets/assets.map',
                srcBasePath: 'static/target/',
                destBasePath: 'static/hash/',
                hashLength: (isDev) ? 0 : 32
            },
            all: {
                options: {
                    preserveSourceMaps: true
                },
                files: [
                    {
                        src: [staticTargetDir + '**/*'],
                        dest: staticHashDir
                    }
                ]
            }
        },

        uglify: {
            javascript: {
                files: [{
                    expand: true,
                    cwd: staticTargetDir + 'javascripts',
                    src: [
                        '{components,vendor}/**/*.js',
                        '!components/curl/**/*.js',
                        '!components/zxcvbn/**/*.js'
                    ],
                    dest: staticTargetDir + 'javascripts'
                }]
            }
        },


        /***********************************************************************
         * Test
         **********************************************************************/

        karma: {
            options: {
                reporters: isDev ? ['dots'] : ['progress'],
                singleRun: singleRun
            },
            common: {
                configFile: testConfDir + 'common.js'
            },
            facia: {
                configFile: testConfDir + 'facia.js'
            },
            membership: {
                configFile: testConfDir + 'membership.js'
            }
        },

        // Lint Javascript sources
        jshint: {
            options: {
                jshintrc: './resources/jshint_conf.json'
            },
            self: [
                'Gruntfile.js'
            ],
            common: {
                files: [{
                    expand: true,
                    cwd: 'common/app/assets/javascripts/',
                    src: ['**/*.js', '!components/**', '!bower_components/**', '!utils/atob.js']
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
            },
            membership: {
                files: [{
                    expand: true,
                    cwd: 'identity/app/assets/javascripts/',
                    src: ['**/*.js']
                }]
            }
        },

        // Lint Sass sources
        scsslint: {
            allFiles: [
                'common/app/assets/stylesheets'
            ],
            options: {
                bundleExec: true,
                config: '.scss-lint.yml',
                reporterOutput: null
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
                    staticTargetDir + 'javascripts/bootstraps/*.js',
                    staticTargetDir + 'stylesheets/*.css'
                ],
                options: {
                    credentials: propertiesFile
                }
            }
        },
        pagespeed: {
            options: {
                nokey: false,
                key: 'AIzaSyAKNTuqwtrbsCLw8htzvzshxLxmeWb3i4s',
                strategy: 'mobile',
                locale: 'en_GB',
                threshold: 80
            },
            facia: {
                url: 'http://www.theguardian.com/uk?view=mobile'
            },
            article: {
                url: 'http://www.theguardian.com/world/2014/jun/07/stephen-fry-denounces-uk-government-edward-snowden-nsa-revelations?view=mobile'
            },
            applications: {
                url: 'http://www.theguardian.com/world/video/2014/jun/07/stephan-fry-surveillance-squalid-rancid-video?view=mobile'
            }
        },

        /*
         * Miscellaneous
         */
        mkdir: {
            fontsTarget: {
                options: {
                    create: [staticTargetDir + 'fonts']
                }
            }
        },

        // Clean stuff up
        clean: {
            js         : [staticTargetDir + 'javascripts', staticHashDir + 'javascripts', requirejsDir],
            css        : [staticTargetDir + 'stylesheets', staticHashDir + 'stylesheets'],
            images     : [staticTargetDir + 'images', staticHashDir + 'images'],
            flash      : [staticTargetDir + 'flash', staticHashDir + 'flash'],
            fonts      : [staticTargetDir + 'fonts', staticHashDir + 'fonts'],
            // Clean any pre-commit hooks in .git/hooks directory
            hooks      : ['.git/hooks/pre-commit'],
            assets     : ['common/conf/assets']
        },

        // Recompile on change
        watch: {
            js: {
                // using watch event to just compile changed project
                files: ['*/app/{assets, public}/javascripts/**/*.js', '!**/components/**'],
                options: {
                    spawn: false
                }
            },
            css: {
                files: ['common/app/assets/stylesheets/**/*.scss'],
                tasks: ['compile:css', 'asset_hash'],
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
        },

        replace: {
            cssSourceMaps: {
                src: [staticTargetDir + 'stylesheets/*.css.map'],
                overwrite: true,
                replacements: [{
                    from: '../../../common/app/assets/stylesheets/',
                    to: ''
                }]
            }
        },

        csdevmode: {
            options: {
                srcBasePath: 'common/app/assets/stylesheets/',
                destBasePath: staticHashDir + '/stylesheets'
            },
            main: {
                assets: ['global', 'head.default', 'head.facia']
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-scss-lint');
    grunt.loadNpmTasks('grunt-css-metrics');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-webfontjson');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-asset-hash');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-asset-monitor');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-pagespeed');
    grunt.loadNpmTasks('grunt-csdevmode');

    // Default task
    grunt.registerTask('default', ['clean', 'validate', 'compile', 'test', 'analyse']);

    /**
     * Validate tasks
     */
    grunt.registerTask('validate:css', ['compile:images', 'sass:compile']);
    grunt.registerTask('validate:sass', ['scsslint']);
    grunt.registerTask('validate:js', function(app) {
        var target = (app) ? ':' + app : '';
        grunt.task.run('jshint' + target);
    });
    grunt.registerTask('validate', function(app) {
        grunt.task.run(['validate:css', 'validate:sass', 'validate:js:' + (app || '')]);
    });

    /**
     * Compile tasks
     */
    grunt.registerTask('compile:images', ['copy:images', 'shell:spriteGeneration', 'imagemin']);
    grunt.registerTask('compile:css', ['sass:compile', 'replace:cssSourceMaps', 'copy:css']);
    grunt.registerTask('compile:js', function() {
        grunt.task.run(['requirejs', 'copy:javascript']);
        if (!isDev) {
            grunt.task.run('uglify:javascript');
        }
    });
    grunt.registerTask('compile:fonts', ['mkdir:fontsTarget', 'webfontjson']);
    grunt.registerTask('compile:flash', ['copy:flash']);
    grunt.registerTask('compile:conf', ['copy:headJs', 'copy:headCss', 'copy:assetMap']);
    grunt.registerTask('compile', [
        'compile:images',
        'compile:css',
        'compile:js',
        'compile:fonts',
        'compile:flash',
        'asset_hash',
        'compile:conf'
    ]);

    /**
     * Test tasks
     */
    grunt.registerTask('test:unit', function(app) {
        var target = app ? ':' + app : '';
        grunt.config.set('karma.options.singleRun', (singleRun === false) ? false : true);
        grunt.task.run('karma' + target);
    });
    grunt.registerTask('test', ['test:unit']);

    /**
     * Analyse tasks
     */
    grunt.registerTask('analyse:performance', function(app) {
        var target = app ? ':' + app : '';
        grunt.task.run('pagespeed' + target);
    });
    grunt.registerTask('analyse:css', ['compile:css', 'cssmetrics:common']);
    grunt.registerTask('analyse:monitor', ['monitor:common']);
    grunt.registerTask('analyse', ['analyse:css', 'analyse:performance']);

    /**
     * Miscellaneous tasks
     */
    grunt.registerTask('hookmeup', ['clean:hooks', 'shell:copyHooks']);
    grunt.registerTask('emitAbTestInfo', 'shell:abTestInfo');

    grunt.event.on('watch', function(action, filepath, target) {
        if (target === 'js') {
            // compile just the project
            var project = filepath.split('/').shift();
            grunt.task.run(['requirejs:' + project, 'copy:javascript', 'asset_hash']);
        }
    });

};

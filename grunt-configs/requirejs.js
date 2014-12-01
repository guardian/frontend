module.exports = function(grunt, options) {
    return {
        options: {
            baseUrl: 'static/src/javascripts',
            paths: {
                bootsraps:    'bootstraps',
                admin:        'projects/admin',
                common:       'projects/common',
                facia:        'projects/facia',
                membership:   'projects/membership',
                bean:         'components/bean/bean',
                bonzo:        'components/bonzo/bonzo',
                enhancer:     'components/enhancer/enhancer',
                EventEmitter: 'components/eventEmitter/EventEmitter',
                fastclick:    'components/fastclick/fastclick',
                fence:        'components/fence/fence',
                imager:       'components/imager.js/container',
                lodash:       'components/lodash-amd',
                Promise:      'components/native-promise-only/npo.src',
                qwery:        'components/qwery/qwery',
                raven:        'components/raven-js/raven',
                react:        'components/react/react',
                reqwest:      'components/reqwest/reqwest',
                omniture:     '../../public/javascripts/vendor/omniture',
                socketio:     'components/socket.io-client/socket.io',
                stripe:       '../../public/javascripts/vendor/stripe/stripe.min',
                // plugins
                text:         'components/requirejs-text/text'
            },
            optimize: options.isDev ? 'none' : 'uglify2',
            generateSourceMaps: true,
            preserveLicenseComments: false,
            fileExclusionRegExp: /^bower_components$/
        },
        common: {
            options: {
                dir: options.requirejsDir,
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
                        name: 'core',
                        exclude: [
                            'text'
                        ]
                    },
                    {
                        name: 'bootstraps/app',
                        exclude: [
                            'core',
                            'text'
                        ]
                    },
                    {
                        name: 'bootstraps/commercial',
                        exclude: [
                            'core',
                            'text'
                        ]
                    }
                ]
            }
        },
        crosswords: {
            options: {
                name: 'bootstraps/crosswords',
                out: options.staticTargetDir + 'javascripts/bootstraps/crosswords.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    'text'
                ]
            }
        },
        facia: {
            options: {
                name: 'bootstraps/facia',
                out: options.staticTargetDir + 'javascripts/bootstraps/facia.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    'text'
                ]
            }
        },
        identity: {
            options: {
                name: 'bootstraps/membership',
                out: options.staticTargetDir + 'javascripts/bootstraps/membership.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    '../../public/javascripts/vendor/stripe/stripe.min',
                    'text'
                ]
            }
        },
        ophan: {
            options: {
                name: 'bootstraps/ophan',
                out: options.staticTargetDir + 'javascripts/bootstraps/ophan.js'
            }
        },
        admin: {
            options: {
                name: 'bootstraps/admin',
                out: options.staticTargetDir + 'javascripts/bootstraps/admin.js',
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
                name: 'bootstraps/video-player',
                out: options.staticTargetDir + 'javascripts/bootstraps/video-player.js',
                paths: {
                    vast: 'components/vast-client-js/vast-client',
                    videojs: 'components/videojs/video',
                    videojsads: 'components/videojs-contrib-ads/videojs.ads',
                    videojsvast: 'components/videojs-vast/videojs.vast',
                    videojspersistvolume: 'components/videojs-persistvolume/videojs.persistvolume',
                    videojsplaylist: 'components/videojs-playlist-audio/videojs.playlist',
                    videoinit: 'projects/video/modules/video-init'
                },
                shim: {
                    videojs: {
                        exports: 'videojs'
                    },
                    videojsads: {
                        deps: ['videojs']
                    },
                    videojsvast: {
                        deps: ['vast', 'videojs', 'videoinit']
                    },
                    videojsplaylist: {
                        deps: ['videojs']
                    }
                },
                wrapShim: true,
                optimize: 'none',
                generateSourceMaps: true,
                preserveLicenseComments: false
            }
        },
        preview: {
            options: {
                name: 'bootstraps/preview',
                out: options.staticTargetDir + 'javascripts/bootstraps/preview.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    'text'
                ]
            }
        },
        dev: {
            options: {
                name: 'bootstraps/dev',
                out: options.staticTargetDir + 'javascripts/bootstraps/dev.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    'text'
                ]
            }
        }
    };
};

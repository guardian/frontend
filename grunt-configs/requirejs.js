module.exports = function(grunt, options) {
    return {
        options: {
            baseUrl: 'static/src/javascripts',
            paths: {
                common:       'common',
                facia:        'facia',
                membership:   'membership',
                bean:         'components/bean/bean',
                bonzo:        'components/bonzo/bonzo',
                EventEmitter: 'components/eventEmitter/EventEmitter',
                qwery:        'components/qwery/qwery',
                reqwest:      'components/reqwest/reqwest',
                lodash:       'components/lodash-amd',
                imager:       'components/imager.js/container',
                fence:        'components/fence/fence',
                enhancer:     'components/enhancer/enhancer',
                stripe:       '../../../common/app/public/javascripts/vendor/stripe/stripe.min',
                raven:        'components/raven-js/raven',
                fastclick:    'components/fastclick/fastclick',
                omniture:     '../../../common/app/public/javascripts/vendor/omniture'
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
                name: 'bootstraps/facia',
                out: options.staticTargetDir + 'javascripts/bootstraps/facia.js',
                exclude: [
                    'core',
                    'bootstraps/app'
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
                    '../../../common/app/public/javascripts/vendor/stripe/stripe.min'
                ]
            }
        },
        ophan: {
            options: {
                name: 'common/bootstraps/ophan',
                out: options.staticTargetDir + 'javascripts/bootstraps/ophan.js'
            }
        },
//        admin: {
//            options: {
//                baseUrl: 'admin/app/assets/javascripts',
//                name: 'bootstraps/admin',
//                out: options.staticTargetDir + 'javascripts/bootstraps/admin.js',
//                shim: {
//                    imager: {
//                        deps: ['common/components/imager.js/imager'],
//                        exports: 'Imager'
//                    },
//                    omniture: {
//                        exports: 's'
//                    }
//                }
//            }
//        },
        video : {
            options: {
                name: 'bootstraps/video-player',
                out: options.staticTargetDir + 'javascripts/bootstraps/video-player.js',
                paths: {
                    vast: '../../../common/app/public/javascripts/vendor/vast-client',
                    videojs: 'components/videojs/video',
                    videojsads: 'components/videojs-contrib-ads/videojs.ads',
                    videojsvast: 'components/videojs-vast/videojs.vast',
                    videojspersistvolume: 'components/videojs-persistvolume/videojs.persistvolume',
                    videojsplaylist: 'components/videojs-playlist-audio/videojs.playlist'
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
                    videojsvast: {
                         deps: ['vast', 'videojs']
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
        dev: {
            options: {
                name: 'bootstraps/dev',
                out: options.staticTargetDir + 'javascripts/bootstraps/dev.js',
                paths: {
                    socketio: 'components/socket.io-client/socket.io'
                }
            },
            exclude: [
                'core',
                'bootstraps/app'
            ]
        }
    };
};

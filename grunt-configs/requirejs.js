module.exports = function(grunt, options) {
    return {
        options: {
            paths: {
                common:       '../../../static/src/javascripts',
                bean:         '../../../static/src/javascripts/components/bean/bean',
                bonzo:        '../../../static/src/javascripts/components/bonzo/bonzo',
                EventEmitter: '../../../static/src/javascripts/components/eventEmitter/EventEmitter',
                qwery:        '../../../static/src/javascripts/components/qwery/qwery',
                reqwest:      '../../../static/src/javascripts/components/reqwest/reqwest',
                lodash:       '../../../static/src/javascripts/components/lodash-amd',
                imager:       '../../../static/src/javascripts/components/imager.js/container',
                fence:        '../../../static/src/javascripts/components/fence/fence',
                enhancer:     '../../../static/src/javascripts/components/enhancer/enhancer',
                stripe:       '../../../common/app/public/javascripts/vendor/stripe/stripe.min',
                raven:        '../../../static/src/javascripts/components/raven-js/raven',
                fastclick:    '../../../static/src/javascripts/components/fastclick/fastclick',
                omniture:     '../../../common/app/public/javascripts/vendor/omniture'
            },
            optimize: options.isDev ? 'none' : 'uglify2',
            generateSourceMaps: true,
            preserveLicenseComments: false,
            fileExclusionRegExp: /^bower_components$/
        },
        common: {
            options: {
                baseUrl: 'static/src/javascripts',
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
                baseUrl: 'facia/app/assets/javascripts',
                name: 'bootstraps/facia',
                out: options.staticTargetDir + 'javascripts/bootstraps/facia.js',
                exclude: [
                    '../../../../static/src/javascripts/core',
                    '../../../../static/src/javascripts/bootstraps/app'
                ]
            }
        },
        identity: {
            options: {
                baseUrl: 'identity/app/assets/javascripts',
                name: 'bootstraps/membership',
                out: options.staticTargetDir + 'javascripts/bootstraps/membership.js',
                exclude: [
                    '../../../../static/src/javascripts/core',
                    '../../../../static/src/javascripts/bootstraps/app',
                    '../../../../common/app/public/javascripts/vendor/stripe/stripe.min'
                ]
            }
        },
        ophan: {
            options: {
                baseUrl: 'static/src/javascripts',
                name: 'common/bootstraps/ophan',
                out: options.staticTargetDir + 'javascripts/bootstraps/ophan.js'
            }
        },
        admin: {
            options: {
                baseUrl: 'admin/app/assets/javascripts',
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
                baseUrl: 'static/src/javascripts',
                name: 'bootstraps/video-player',
                out: options.staticTargetDir + 'javascripts/bootstraps/video-player.js',
                paths: {
                    vast: '../../../../common/app/public/javascripts/vendor/vast-client',
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
                baseUrl: 'static/src/javascripts',
                name: 'bootstraps/dev',
                out: options.staticTargetDir + 'javascripts/bootstraps/dev.js',
                paths: {
                    socketio: 'components/socket.io-client/socket.io'
                }
            },
            exclude: ['core','bootstraps/app']
        }
    };
};

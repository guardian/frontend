module.exports = function(grunt, options) {
    return {
        options: {
            baseUrl: 'static/src/javascripts',
            paths: {
                admin:                'projects/admin',
                common:               'projects/common',
                facia:                'projects/facia',
                membership:           'projects/membership',
                bean:                 'components/bean/bean',
                bonzo:                'components/bonzo/bonzo',
                enhancer:             'components/enhancer/enhancer',
                EventEmitter:         'components/eventEmitter/EventEmitter',
                fastclick:            'components/fastclick/fastclick',
                fastdom:              'components/fastdom/index',
                fence:                'components/fence/fence',
                imager:               'components/imager.js/container',
                lodash:               'components/lodash-amd',
                picturefill:          'projects/common/utils/picturefill',
                Promise:              'components/native-promise-only/npo.src',
                qwery:                'components/qwery/qwery',
                raven:                'components/raven-js/raven',
                react:                'components/react/react',
                reqwest:              'components/reqwest/reqwest',
                omniture:             '../../public/javascripts/vendor/omniture',
                socketio:             'components/socket.io-client/socket.io',
                stripe:               '../../public/javascripts/vendor/stripe/stripe.min',
                svgs:                 '../../../common/conf/assets/inline-svgs',
                videojs:              'components/videojs/video',
                videojsads:           'components/videojs-contrib-ads/videojs.ads',
                videojsembed:         'components/videojs-embed/videojs.embed',
                videojsima:           'components/videojs-ima/videojs.ima',
                videojspersistvolume: 'components/videojs-persistvolume/videojs.persistvolume',
                videojsplaylist:      'components/videojs-playlist-audio/videojs.playlist',
                // plugins
                text:                 'components/requirejs-text/text',
                inlineSvg:            'components/requirejs-inline-svg/inlineSvg'
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
                            'text',
                            'inlineSvg'
                        ]
                    },
                    {
                        name: 'bootstraps/app',
                        exclude: [
                            'core',
                            'text',
                            'inlineSvg'
                        ]
                    },
                    {
                        name: 'bootstraps/commercial',
                        exclude: [
                            'core',
                            'text',
                            'inlineSvg'
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
                    'text',
                    'inlineSvg'
                ]
            }
        },
        sudoku: {
            options: {
                name: 'bootstraps/sudoku',
                out: options.staticTargetDir + 'javascripts/bootstraps/sudoku.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        "image-content": {
            options: {
                name: 'bootstraps/image-content',
                out: options.staticTargetDir + 'javascripts/bootstraps/image-content.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    'text',
                    'inlineSvg'
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
                    'text',
                    'inlineSvg'
                ]
            }
        },
        football: {
            options: {
                name: 'bootstraps/football',
                    out: options.staticTargetDir + 'javascripts/bootstraps/football.js',
                    exclude: [
                    'core',
                    'bootstraps/app',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        preferences: {
            options: {
                name: 'bootstraps/preferences',
                out: options.staticTargetDir + 'javascripts/bootstraps/preferences.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    'text',
                    'inlineSvg'
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
                    'text',
                    'inlineSvg'
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
                        deps: ['components/imager.js/imager'],
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
                shim: {
                    videojs: {
                        exports: 'videojs'
                    },
                    videojsads: {
                        deps: ['videojs']
                    },
                    videojsima: {
                        deps: ['videojs']
                    },
                    videojsplaylist: {
                        deps: ['videojs']
                    },
                    videojsembed: {
                        deps: ['videojs']
                    }
                },
                wrapShim: true,
                exclude: [
                    'text',
                    'inlineSvg'
                ],
                generateSourceMaps: true,
                preserveLicenseComments: false
            }
        },
        videoEmbed : {
            options: {
                name: 'bootstraps/video-embed',
                out: options.staticTargetDir + 'javascripts/bootstraps/video-embed.js',
                shim: {
                    videojs: {
                        exports: 'videojs'
                    },
                    videojsembed: {
                        deps: ['videojs']
                    },
                    imager: {
                        deps: ['components/imager.js/imager'],
                        exports: 'Imager'
                    },
                    omniture: {
                        exports: 's'
                    }
                },
                exclude: [
                    'text',
                    'inlineSvg'
                ],
                generateSourceMaps: true,
                preserveLicenseComments: false
            }
        },
        dev: {
            options: {
                name: 'bootstraps/dev',
                out: options.staticTargetDir + 'javascripts/bootstraps/dev.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        creatives: {
            options: {
                name: 'bootstraps/creatives',
                out: options.staticTargetDir + 'javascripts/bootstraps/creatives.js',
                exclude: [
                    'core',
                    'bootstraps/app',
                    'bootstraps/commercial',
                    'text',
                    'inlineSvg'
                ]
            }
        }
    };
};

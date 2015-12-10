module.exports = function (grunt, options) {
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
                fastdom:              'components/fastdom/index',
                fence:                'components/fence/fence',
                lodash:               'components/lodash-amd',
                picturefill:          'projects/common/utils/picturefill',
                Promise:              'components/when/Promise',
                qwery:                'components/qwery/qwery',
                raven:                'components/raven-js/raven',
                react:                'components/react/react',
                classnames:           'components/classnames/index',
                reqwest:              'components/reqwest/reqwest',
                stripe:               'vendor/stripe/stripe.min',
                svgs:                 '../../../common/conf/assets/inline-svgs',
                videojs:              'components/video.js/video.min',
                videojsads:           'components/videojs-contrib-ads/videojs.ads.min',
                videojsembed:         'components/videojs-embed/videojs.embed',
                videojsima:           'components/videojs-ima/videojs.ima',
                videojspersistvolume: 'components/videojs-persistvolume/videojs.persistvolume',
                videojsplaylist:      'components/videojs-playlist-audio/videojs.playlist',
                // plugins
                text:                 'components/requirejs-text/text',
                inlineSvg:            'projects/common/utils/inlineSvg',
                'ophan/ng':           'empty:'
            },
            optimize: options.isDev ? 'none' : 'uglify2',
            generateSourceMaps: true,
            preserveLicenseComments: false,
            fileExclusionRegExp: /^bower_components|test$/i
        },
        common: {
            options: {
                dir: options.requirejsDir,
                keepBuildDir: false,
                shim: {

                },
                modules: [
                    {
                        name: 'bootstraps/standard',
                        exclude: [
                            'text',
                            'inlineSvg'
                        ]
                    },
                    {
                        name: 'core',
                        exclude: [
                            'bootstraps/standard',
                            'text',
                            'inlineSvg'
                        ]
                    },
                    {
                        name: 'bootstraps/enhanced',
                        exclude: [
                            'bootstraps/standard',
                            'core',
                            'text',
                            'inlineSvg'
                        ]
                    },
                    {
                        name: 'bootstraps/commercial',
                        exclude: [
                            'bootstraps/standard',
                            'core',
                            'text',
                            'inlineSvg'
                        ]
                    }
                ]
            }
        },
        article: {
            options: {
                name: 'bootstraps/article',
                out: options.staticTargetDir + 'javascripts/bootstraps/article.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        crosswords: {
            options: {
                name: 'bootstraps/crosswords',
                out: options.staticTargetDir + 'javascripts/bootstraps/crosswords.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        liveblog: {
            options: {
                name: 'bootstraps/liveblog',
                out: options.staticTargetDir + 'javascripts/bootstraps/liveblog.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        gallery: {
            options: {
                name: 'bootstraps/gallery',
                out: options.staticTargetDir + 'javascripts/bootstraps/gallery.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        trail: {
            options: {
                name: 'bootstraps/trail',
                out: options.staticTargetDir + 'javascripts/bootstraps/trail.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        profile: {
            options: {
                name: 'bootstraps/profile',
                out: options.staticTargetDir + 'javascripts/bootstraps/profile.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
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
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        'image-content': {
            options: {
                name: 'bootstraps/image-content',
                out: options.staticTargetDir + 'javascripts/bootstraps/image-content.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
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
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
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
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
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
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
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
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
                    'vendor/stripe/stripe.min',
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
                    omniture: {
                        exports: 's'
                    }
                }
            }
        },
        media: {
            options: {
                name: 'bootstraps/media',
                out: options.staticTargetDir + 'javascripts/bootstraps/media.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
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
                exclude: [
                    'text',
                    'inlineSvg'
                ],
                generateSourceMaps: true,
                preserveLicenseComments: false
            }
        },
        creatives: {
            options: {
                name: 'bootstraps/creatives',
                out: options.staticTargetDir + 'javascripts/bootstraps/creatives.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
                    'bootstraps/commercial',
                    'text',
                    'inlineSvg'
                ]
            }
        },
        accessibility: {
            options: {
                name: 'bootstraps/accessibility',
                out: options.staticTargetDir + 'javascripts/bootstraps/accessibility.js',
                exclude: [
                    'bootstraps/standard',
                    'core',
                    'bootstraps/enhanced',
                    'bootstraps/facia',
                    'text',
                    'inlineSvg'
                ]
            }
        }
    };
};

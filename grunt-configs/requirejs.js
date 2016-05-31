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
                domReady:             'components/domready/ready',
                enhancer:             'components/enhancer/enhancer',
                EventEmitter:         'components/eventEmitter/EventEmitter',
                fastdom:              'components/fastdom/index',
                fence:                'components/fence/fence',
                lodash:               'components/lodash-amd',
                picturefill:          'projects/common/utils/picturefill',
                Promise:              'components/when/Promise',
                qwery:                'components/qwery/qwery',
                raven:                'components/raven-js/raven',
                classnames:           'components/classnames/index',
                reqwest:              'components/reqwest/reqwest',
                stripe:               'vendor/stripe/stripe.min',
                svgs:                 '../../../common/conf/assets/inline-svgs',
                videojs:              'components/video.js/video',
                videojsads:           'components/videojs-contrib-ads/videojs.ads',
                videojsembed:         'components/videojs-embed/videojs.embed',
                videojsima:           'components/videojs-ima/videojs.ima',
                videojspersistvolume: 'components/videojs-persistvolume/videojs.persistvolume',
                videojsplaylist:      'components/videojs-playlist-audio/videojs.playlist',
                // plugins
                text:                 'components/requirejs-text/text',
                inlineSvg:            'projects/common/utils/inlineSvg',
                tpl:                  'projects/common/utils/lodash-loader',

                'react':              'empty:',
                'ophan/ng':           'empty:'
            },
            optimize: options.isDev ? 'none' : 'uglify2',
            generateSourceMaps: true,
            preserveLicenseComments: false,
            fileExclusionRegExp: /^bower_components/i
        },
        boot: {
            options: {
                name: 'boot',
                out: options.staticTargetDir + 'javascripts/boot.js',
                include: 'bootstraps/standard/main',
                insertRequire: ['boot'],
                exclude: [
                    'text',
                    'inlineSvg'
                ]
            }
        },
        commercial: {
            options: {
                name: 'bootstraps/commercial',
                out: options.staticTargetDir + 'javascripts/bootstraps/commercial.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        enhanced: {
            options: {
                name: 'bootstraps/enhanced/main',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/main.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        article: {
            options: {
                name: 'bootstraps/enhanced/article',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/article.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        minute: {
            options: {
                name: 'bootstraps/enhanced/article-minute',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/article-minute.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        crosswords: {
            options: {
                name: 'bootstraps/enhanced/crosswords',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/crosswords.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        liveblog: {
            options: {
                name: 'bootstraps/enhanced/liveblog',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/liveblog.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        gallery: {
            options: {
                name: 'bootstraps/enhanced/gallery',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/gallery.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        trail: {
            options: {
                name: 'bootstraps/enhanced/trail',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/trail.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        profile: {
            options: {
                name: 'bootstraps/enhanced/profile',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/profile.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        sudoku: {
            options: {
                name: 'bootstraps/enhanced/sudoku',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/sudoku.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        'image-content': {
            options: {
                name: 'bootstraps/enhanced/image-content',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/image-content.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        facia: {
            options: {
                name: 'bootstraps/enhanced/facia',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/facia.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        football: {
            options: {
                name: 'bootstraps/enhanced/football',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/football.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        preferences: {
            options: {
                name: 'bootstraps/enhanced/preferences',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/preferences.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        identity: {
            options: {
                name: 'bootstraps/enhanced/membership',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/membership.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'vendor/stripe/stripe.min',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        },
        ophan: {
            options: {
                name: 'bootstraps/enhanced/ophan',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/ophan.js'
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
                name: 'bootstraps/enhanced/media/main',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/media/main.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'text',
                    'inlineSvg',
                    'tpl'
                ],
                generateSourceMaps: true,
                preserveLicenseComments: false,
                shim: {
                    videojsima: {
                        deps: ['videojsads']
                    },
                    videojsads: {
                        deps: ['bootstraps/enhanced/media/videojs-global']
                    }
                }
            }
        },
        videoEmbed : {
            options: {
                name: 'bootstraps/video-embed',
                out: options.staticTargetDir + 'javascripts/bootstraps/video-embed.js',
                exclude: [
                    'text',
                    'inlineSvg',
                    'tpl'
                ],
                generateSourceMaps: true,
                preserveLicenseComments: false
            }
        },
        accessibility: {
            options: {
                name: 'bootstraps/enhanced/accessibility',
                out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/accessibility.js',
                exclude: [
                    'boot',
                    'bootstraps/standard/main',
                    'bootstraps/commercial',
                    'bootstraps/enhanced/main',
                    'bootstraps/enhanced/facia',
                    'text',
                    'inlineSvg',
                    'tpl'
                ]
            }
        }
    };
};

module.exports = function (grunt, options) {
    return {
        options: {
            baseUrl: 'static/src/javascripts',
            paths: {
                admin:                'projects/admin',
                common:               'projects/common',
                facia:                'projects/facia',
                membership:           'projects/membership',
                bean:                 '../../../node_modules/bean/bean',
                bonzo:                '../../../node_modules/bonzo/bonzo',
                domReady:             '../../../node_modules/domready/ready',
                EventEmitter:         '../../../node_modules/wolfy87-eventemitter/EventEmitter',
                fastdom:              '../../../node_modules/fastdom/index',
                fence:                '../../../node_modules/fence/fence',
                lodash:               '../../../node_modules/lodash-amd/compat',
                picturefill:          'projects/common/utils/picturefill',
                Promise:              '../../../node_modules/when/es6-shim/Promise',
                qwery:                '../../../node_modules/qwery/qwery',
                raven:                '../../../node_modules/raven-js/dist/raven',
                classnames:           '../../../node_modules/classnames/index',
                reqwest:              '../../../node_modules/reqwest/reqwest',
                stripe:               'vendor/stripe/stripe.min',
                svgs:                 '../../../common/conf/assets/inline-svgs',
                videojs:              '../../../node_modules/video.js/dist/video',
                videojsads:           '../../../node_modules/videojs-contrib-ads/src/videojs.ads',
                videojsembed:         '../../../node_modules/videojs-embed/dist/videojs.embed',
                videojsima:           '../../../node_modules/videojs-ima/src/videojs.ima',
                videojspersistvolume: '../../../node_modules/videojs-persistvolume/videojs.persistvolume',
                videojsplaylist:      '../../../node_modules/videojs-playlist/javascripts/videojs.playlist',
                // plugins
                text:                 '../../../node_modules/requirejs-text/text',
                inlineSvg:            'projects/common/utils/inlineSvg',

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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
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
                    'inlineSvg'
                ]
            }
        }
    };
};

@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.Static
@import conf.Configuration

var curl = {
    baseUrl: '@{Configuration.assets.path}javascripts',
    apiName: 'require',
    paths: {
        @if(play.Play.isDev()) {
            admin:                          'projects/admin',
            common:                         'projects/common',
            facia:                          'projects/facia',
            membership:                     'projects/membership',
            stripe:                         'vendor/stripe/stripe.min',
            bean:                           'components/bean/bean',
            bonzo:                          'components/bonzo/bonzo',
            react:                          'components/react/react',
            classnames:                     'components/classnames/index',
            enhancer:                       'components/enhancer/enhancer',
            EventEmitter:                   'components/eventEmitter/EventEmitter',
            fastclick:                      'components/fastclick/fastclick',
            fastdom:                        'components/fastdom/index',
            fence:                          'components/fence/fence',
            lodash:                         'components/lodash-amd',
            picturefill:                    'projects/common/utils/picturefill',
            Promise:                        'components/when/Promise',
            qwery:                          'components/qwery/qwery',
            raven:                          'components/raven-js/raven',
            reqwest:                        'components/reqwest/reqwest',
            'facebook.js':                  '//connect.facebook.net/en_US/all.js',
            'foresee.js':                   'vendor/foresee/20150703/foresee-trigger.js',
            'googletag.js':                 '@{Configuration.javascript.config("googletagJsUrl")}',
            'ophan/ng':                     '@{Configuration.javascript.config("ophanJsUrl")}',
            svgs:                           '../inline-svgs',
            'bootstraps/video-player':      'bootstraps/video-player-dev.js',
            videojs:                        'components/video.js/video.min.js',
            videojsads:                     'components/videojs-contrib-ads/videojs.ads.min.js',
            videojsembed:                   'components/videojs-embed/videojs.embed.js',
            videojsima:                     'components/videojs-ima/videojs.ima.js',
            videojspersistvolume:           'components/videojs-persistvolume/videojs.persistvolume.js',
            videojsplaylist:                'components/videojs-playlist-audio/videojs.playlist.js',

            // plugins
            text:         'components/requirejs-text/text',
            inlineSvg:    'projects/common/utils/inlineSvg'
        } else {
            core:                       '@Static("javascripts/core.js")',
            'bootstraps/standard':      '@Static("javascripts/bootstraps/standard.js")',
            'bootstraps/enhanced':      '@Static("javascripts/bootstraps/enhanced.js")',
            'bootstraps/crosswords':    '@Static("javascripts/bootstraps/crosswords.js")',
            'bootstraps/accessibility': '@Static("javascripts/bootstraps/accessibility.js")',
            'bootstraps/commercial':    '@Static("javascripts/bootstraps/commercial.js")',
            'bootstraps/creatives':     '@Static("javascripts/bootstraps/creatives.js")',
            'bootstraps/preferences':   '@Static("javascripts/bootstraps/preferences.js")',
            'bootstraps/facia':         '@Static("javascripts/bootstraps/facia.js")',
            'bootstraps/football':      '@Static("javascripts/bootstraps/football.js")',
            'bootstraps/image-content': '@Static("javascripts/bootstraps/image-content.js")',
            'bootstraps/membership':    '@Static("javascripts/bootstraps/membership.js")',
            'bootstraps/sudoku':        '@Static("javascripts/bootstraps/sudoku.js")',
            'bootstraps/media':         '@Static("javascripts/bootstraps/media.js")',
            'bootstraps/article':       '@Static("javascripts/bootstraps/article.js")',
            'bootstraps/liveblog':      '@Static("javascripts/bootstraps/liveblog.js")',
            'bootstraps/trail':         '@Static("javascripts/bootstraps/trail.js")',
            'bootstraps/gallery':       '@Static("javascripts/bootstraps/gallery.js")',
            'bootstraps/profile':       '@Static("javascripts/bootstraps/profile.js")',
            'foresee.js':               'vendor/foresee/20150703/foresee-trigger.js',
            'googletag.js':             '@{Configuration.javascript.config("googletagJsUrl")}',
            stripe:                     '@Static("javascripts/vendor/stripe/stripe.min.js")',
            zxcvbn:                     '@Static("javascripts/components/zxcvbn/zxcvbn.js")',
            'facebook.js':              '//connect.facebook.net/en_US/all.js',
            'ophan/ng':                 '@{Configuration.javascript.config("ophanJsUrl")}',

            // plugins
            text:                       'text', // noop
            inlineSvg:                  'inlineSvg' // noop
        }
    }
};

@JavaScript(Static.js.curl);

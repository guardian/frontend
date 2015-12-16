@()(implicit request: RequestHeader)
@import conf.Static
@import conf.Configuration

window.curlConfig = {
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
            domReady:                       'components/domready/ready',
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
            'bootstraps/enhanced/media/video-player': 'bootstraps/enhanced/media/video-player-dev.js',
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
            'enhanced-vendor':                   '@Static("javascripts/enhanced-vendor.js")',
            'bootstraps/enhanced/main':          '@Static("javascripts/bootstraps/enhanced/main.js")',
            'bootstraps/enhanced/crosswords':    '@Static("javascripts/bootstraps/enhanced/crosswords.js")',
            'bootstraps/enhanced/accessibility': '@Static("javascripts/bootstraps/enhanced/accessibility.js")',
            'bootstraps/commercial':             '@Static("javascripts/bootstraps/commercial.js")',
            'bootstraps/enhanced/preferences':   '@Static("javascripts/bootstraps/enhanced/preferences.js")',
            'bootstraps/enhanced/facia':         '@Static("javascripts/bootstraps/enhanced/facia.js")',
            'bootstraps/enhanced/football':      '@Static("javascripts/bootstraps/enhanced/football.js")',
            'bootstraps/enhanced/image-content': '@Static("javascripts/bootstraps/enhanced/image-content.js")',
            'bootstraps/enhanced/membership':    '@Static("javascripts/bootstraps/enhanced/membership.js")',
            'bootstraps/enhanced/sudoku':        '@Static("javascripts/bootstraps/enhanced/sudoku.js")',
            'bootstraps/enhanced/media/main':    '@Static("javascripts/bootstraps/enhanced/media/main.js")',
            'bootstraps/enhanced/article':       '@Static("javascripts/bootstraps/enhanced/article.js")',
            'bootstraps/enhanced/liveblog':      '@Static("javascripts/bootstraps/enhanced/liveblog.js")',
            'bootstraps/enhanced/trail':         '@Static("javascripts/bootstraps/enhanced/trail.js")',
            'bootstraps/enhanced/gallery':       '@Static("javascripts/bootstraps/enhanced/gallery.js")',
            'bootstraps/enhanced/profile':       '@Static("javascripts/bootstraps/enhanced/profile.js")',
            'foresee.js':               'vendor/foresee/20150703/foresee-trigger.js',
            'googletag.js':             '@{Configuration.javascript.config("googletagJsUrl")}',
            stripe:                     '@Static("javascripts/vendor/stripe/stripe.min.js")',
            react:                      '@Static("javascripts/components/react/react.js")',
            'facebook.js':              '//connect.facebook.net/en_US/all.js',
            'ophan/ng':                 '@{Configuration.javascript.config("ophanJsUrl")}',

            // plugins
            text:                       'text', // noop
            inlineSvg:                  'inlineSvg' // noop
        }
    }
};
// curl will read from window.curl
window.curl = window.curlConfig;

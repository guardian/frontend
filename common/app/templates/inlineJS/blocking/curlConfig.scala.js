@()(implicit request: RequestHeader)
@import conf.Static
@import conf.Configuration

window.curlConfig = {
    baseUrl: '@{Configuration.assets.path}javascripts',
    apiName: 'require',
    paths: {
        @if(Configuration.assets.useHashedBundles) {
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
            'bootstraps/enhanced/article-minute':'@Static("javascripts/bootstraps/enhanced/article-minute.js")',
            'bootstraps/enhanced/trail':         '@Static("javascripts/bootstraps/enhanced/trail.js")',
            'bootstraps/enhanced/gallery':       '@Static("javascripts/bootstraps/enhanced/gallery.js")',
            'bootstraps/enhanced/profile':       '@Static("javascripts/bootstraps/enhanced/profile.js")',
            'foresee.js':                        'vendor/foresee/20150703/foresee-trigger.js',
            'googletag.js':                      '@{Configuration.javascript.config("googletagJsUrl")}',
            stripe:                              '@Static("javascripts/vendor/stripe/stripe.min.js")',
            react:                               '@Static("javascripts/vendor/react-with-addons.js")',
            'ophan/ng':                          '@{Configuration.javascript.config("ophanJsUrl")}',
            'prebid.js':                         '@Static("javascripts/vendor/prebid/0.8.1/prebid.js")',

            // plugins
            text:                                'text', // noop
            inlineSvg:                           'inlineSvg' // noop
        } else {
            admin:                          'projects/admin',
            common:                         'projects/common',
            facia:                          'projects/facia',
            membership:                     'projects/membership',
            stripe:                         'vendor/stripe/stripe.min',
            bean:                           '../bean/bean',
            bonzo:                          '../bonzo/bonzo',
            react:                          '../react/dist/react-with-addons',
            classnames:                     '../classnames/index',
            domReady:                       '../domready/ready',
            EventEmitter:                   '../wolfy87-eventemitter/EventEmitter',
            fastdom:                        '../fastdom/index',
            fence:                          '../fence/fence',
            lodash:                         '../lodash-amd/compat',
            picturefill:                    'projects/common/utils/picturefill',
            Promise:                        '../when/es6-shim/Promise',
            qwery:                          '../qwery/qwery',
            raven:                          '../raven-js/dist/raven',
            reqwest:                        '../reqwest/reqwest',
            'foresee.js':                   'vendor/foresee/20150703/foresee-trigger.js',
            'googletag.js':                 '@{Configuration.javascript.config("googletagJsUrl")}',
            'ophan/ng':                     '@{Configuration.javascript.config("ophanJsUrl")}',
            'prebid.js':                    'vendor/prebid/0.8.1/prebid.js',
            svgs:                           '../inline-svgs',

            // video
            'bootstraps/enhanced/media/video-player':   'bootstraps/enhanced/media/video-player-dev.js',
            videojs:                                    '../video.js/dist/video.js',
            'videojs-contrib-ads':                      '../videojs-contrib-ads/src/videojs.ads.js',
            videojsembed:                               '../videojs-embed/dist/videojs.embed.js',
            'videojs-ima':                              '../videojs-ima/src/videojs.ima.js',
            videojspersistvolume:                       '../videojs-persistvolume/videojs.persistvolume.js',
            videojsplaylist:                            '../videojs-playlist/javascripts/videojs.playlist.js',

            // These paths are for the pre-fetch-modules.js performance-optimisation module, used by boot.js.
            // The resolved paths are loaded through pre-fetch-modules XHR, not curl, so they don't inherit the standard baseUrl.
            'bootstraps/enhanced/main':                 '@{Configuration.assets.path}javascripts/bootstraps/enhanced/main.js',
            'bootstraps/commercial':                    '@{Configuration.assets.path}javascripts/bootstraps/commercial.js',

            // plugins
            text:         '../requirejs-text/text',
            inlineSvg:    'projects/common/utils/inlineSvg'
        }
    }
};
// curl will read from window.curl
window.curl = window.curlConfig;

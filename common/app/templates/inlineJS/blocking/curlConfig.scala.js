@()(implicit request: RequestHeader)
@import conf.Static
@import conf.Configuration

window.curlConfig = {
    baseUrl: '@{Configuration.assets.path}javascripts',
    apiName: 'require',
    @* We need this as a dependecy for the ima and ads plugins *@
    @if(!Configuration.assets.useHashedBundles){ preloads: ['bootstraps/enhanced/media/videojs-global'], }
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
            react:                               '@Static("javascripts/components/react/react.js")',
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
            bean:                           'components/bean/bean',
            bonzo:                          'components/bonzo/bonzo',
            react:                          'components/react/react',
            classnames:                     'components/classnames/index',
            domReady:                       'components/domready/ready',
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
            'foresee.js':                   'vendor/foresee/20150703/foresee-trigger.js',
            'googletag.js':                 '@{Configuration.javascript.config("googletagJsUrl")}',
            'ophan/ng':                     '@{Configuration.javascript.config("ophanJsUrl")}',
            'prebid.js':                    'vendor/prebid/0.8.1/prebid.js',
            svgs:                           '../inline-svgs',

            // video
            'videojs-ima':                  'bootstraps/enhanced/media/videojs-ima.js',
            'videojs':                      'components/video.js/video.js',
            'videojs-ima-lib':              'components/videojs-ima/videojs.ima.js',
            'videojs-ads-lib':              'components/videojs-contrib-ads/videojs.ads.js',
            'videojs-embed':                'components/videojs-embed/videojs.embed.js',
            'videojs-persistvolume':        'components/videojs-persistvolume/videojs.persistvolume.js',
            'videojs-playlist':             'components/videojs-playlist-audio/videojs.playlist.js',

            // These paths are for the pre-fetch-modules.js performance-optimisation module, used by boot.js.
            // The resolved paths are loaded through pre-fetch-modules XHR, not curl, so they don't inherit the standard baseUrl.
            'bootstraps/enhanced/main':                 '@{Configuration.assets.path}javascripts/bootstraps/enhanced/main.js',
            'bootstraps/commercial':                    '@{Configuration.assets.path}javascripts/bootstraps/commercial.js',

            // plugins
            text:         'components/requirejs-text/text',
            inlineSvg:    'projects/common/utils/inlineSvg'
        }
    }
};
// curl will read from window.curl
window.curl = window.curlConfig;

@(item: model.MetaData, curlPaths: Map[String, String] = Map())(implicit request: RequestHeader)
@import conf.Switches._
@import conf.Static
@import conf.Configuration

var curl = {
    baseUrl: '@{Configuration.assets.path}javascripts',
    apiName: 'require',
    paths: {
        @curlPaths.map { case (module, path) =>
            '@module': '@Static(path)',
        }
        core:                       '@Static("javascripts/core.js")',
        'facebook.js':              '//connect.facebook.net/en_US/all.js',
        'foresee.js':               'vendor/foresee/20150703/foresee-trigger.js',
        'googletag.js':             '@{Configuration.javascript.config("googletagJsUrl")}',
        'ophan/ng':                 '@{Configuration.javascript.config("ophanJsUrl")}',
        stripe:                     '@Static("javascripts/vendor/stripe/stripe.min.js")',
        text:                       'text', // noop
        inlineSvg:                  'inlineSvg', // noop
        zxcvbn:                     '@Static("javascripts/components/zxcvbn/zxcvbn.js")',
        'bootstraps/accessibility': '@Static("javascripts/bootstraps/accessibility.js")',
        'bootstraps/app':           '@Static("javascripts/bootstraps/app.js")',
        'bootstraps/commercial':    '@Static("javascripts/bootstraps/commercial.js")',
        'bootstraps/creatives':     '@Static("javascripts/bootstraps/creatives.js")',
        'bootstraps/dev':           '@Static("javascripts/bootstraps/dev.js")',
        'bootstraps/preferences':   '@Static("javascripts/bootstraps/preferences.js")',
        @if(item.isFront) {
            'bootstraps/facia':         '@Static("javascripts/bootstraps/facia.js")',
        }
        'bootstraps/football':      '@Static("javascripts/bootstraps/football.js")',
        'bootstraps/image-content': '@Static("javascripts/bootstraps/image-content.js")',
        'bootstraps/membership':    '@Static("javascripts/bootstraps/membership.js")',
        'bootstraps/sudoku':        '@Static("javascripts/bootstraps/sudoku.js")',
        'bootstraps/video-player':  '@Static("javascripts/bootstraps/video-player.js")',
        'bootstraps/article': '@Static("javascripts/bootstraps/article.js")',
        'bootstraps/liveblog': '@Static("javascripts/bootstraps/liveblog.js")',
        'bootstraps/trail': '@Static("javascripts/bootstraps/trail.js")',
        'bootstraps/gallery': '@Static("javascripts/bootstraps/gallery.js")',
        'bootstraps/profile': '@Static("javascripts/bootstraps/profile.js")'
    }
};

@JavaScript(Static.js.curl)

require([
    'core',
    'domReady!'
]).next([
    'raven'
], function(
    raven
) {

    raven.config(
        'http://' + guardian.config.page.sentryPublicApiKey + '@@' + guardian.config.page.sentryHost,
        {
            whitelistUrls: [
                /localhost/, @* will not actually log errors, but `shouldSendCallback` will be called *@
                /assets\.guim\.co\.uk/,
                /ophan\.co\.uk/
            ],
            tags: {
                edition:        guardian.config.page.edition,
                contentType:    guardian.config.page.contentType,
                revisionNumber: guardian.config.page.revisionNumber,
                loaderType:     'Curl'
            },
            dataCallback: function(data) {
                if (data.culprit) {
                    data.culprit = data.culprit.replace(/\/[a-z\d]{32}(\/[^\/]+)$/, '$1');
                }
                data.tags.origin = (/j.ophan.co.uk/.test(data.culprit)) ? 'ophan' : 'app';
                return data;
            },
            shouldSendCallback: function(data) {
                @if(play.Play.isDev()) {
                    // Some environments don't support or don't always expose the console object
                    if (window.console && window.console.warn) {
                        console.warn('Raven captured error.', data);
                    }
                }

                return @conf.Switches.DiagnosticsLogging.isSwitchedOn &&
                    Math.random() < 0.2 &&
                    @{!play.Play.isDev()}; @* don't actually notify sentry in dev mode*@
            }
        }
    );

    // Report uncaught exceptions
    raven.install();

    var oldOnError = window.onerror;
    window.onerror = function (message, filename, lineno, colno, error) {
        // Not all browsers pass the error object
        if (!error || !error.reported) {
            oldOnError.apply(window, arguments);
        }
    };

    // IE8 and below use attachEvent
    if (!window.addEventListener) {
        window.addEventListener = window.attachEvent;
    }

    // Report unhandled promise rejections
    // https://github.com/cujojs/when/blob/master/docs/debug-api.md#browser-window-events
    window.addEventListener('unhandledRejection', function (event) {
        var error = event.detail.reason;
        if (error && !error.reported) {
            raven.captureException(error);
        }
    });

    require([
        'common/utils/config',
        'common/modules/experiments/ab',
        'common/modules/ui/images',
        'common/utils/storage'
    ], function (
        config,
        ab,
        images,
        storage
    ) {
        var alreadyVisted;

        if (guardian.isModernBrowser) {
            ab.segmentUser();
            ab.run();
        }
        if(guardian.config.page.isFront) {
            if(!document.addEventListener) { // IE8 and below
                window.onload = images.upgradePictures;
            }
        }
        images.upgradePictures();
        images.listen();

        if (guardian.isModernBrowser) {
            alreadyVisted = storage.local.get('alreadyVisited') || 0;
            storage.local.set('alreadyVisited', alreadyVisted + 1);
        }

        // Preference pages are served via HTTPS for service worker support.
        // These pages must not have mixed (HTTP/HTTPS) content, so
        // we disable ads (until the day comes when all ads are HTTPS).
        if (config.switches.commercial && !config.page.isPreferencesPage) {
            require(['bootstraps/commercial'], raven.wrap(
                { tags: { feature: 'commercial' } },
                function (commercial) {
                    commercial.init();
                }
            ));
        }

        if (guardian.isModernBrowser) {
            @if(play.Play.isDev()) {
                require(['bootstraps/dev'], function (devmode) { devmode.init(); });
            }

            require(['bootstraps/app'], function(bootstrap) {
                bootstrap.go();
            });
        }

    });

    @JavaScript(templates.headerInlineJS.js.membershipAccess(item).body)

});

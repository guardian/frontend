@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.switches.Switches._
@import conf.Static
@import conf.Configuration

System['import']('core').then(function () {
    return function(){var e=[],t,n=document,r=n.documentElement.doScroll,i="DOMContentLoaded",s=(r?/^loaded|^c/:/^loaded|^i|^c/).test(n.readyState);return s||n.addEventListener(i,t=function(){n.removeEventListener(i,t),s=1;while(t=e.shift())t()}),function(t){s?setTimeout(t,0):e.push(t)}}();
}).then(function (domready) {
    domready(function () {
        System['import']('raven').then(function (raven) {
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
                        loaderType:     'SystemJs'
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
                        return @conf.switches.Switches.DiagnosticsLogging.isSwitchedOn &&
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

            // Report unhandled promise rejections
            // https://github.com/cujojs/when/blob/master/docs/debug-api.md#browser-window-events
            window.addEventListener('unhandledRejection', function (event) {
                var error = event.detail.reason;
                if (error && !error.reported) {
                    raven.captureException(error);
                }
            });

            // Safe to depend on Lodash because it's part of core
            System['import']('common/utils/_').then(function (_) {
                var importAll = function (moduleIds) {
                    return Promise.all(_(moduleIds)
                        .map(function(module){ return System['import'](module); })
                        .value());
                };
                importAll([
                    'common/utils/config',
                    'common/modules/experiments/ab',
                    'common/modules/ui/images',
                    'common/utils/storage']).then(function(values) {
                    var config = values[0];
                    var ab = values[1];
                    var images = values[2];
                    var storage = values[3];
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
                        alreadyVisted = storage.local.get('gu.alreadyVisited') || 0;
                        storage.local.set('gu.alreadyVisited', alreadyVisted + 1);
                    }

                    // Preference pages are served via HTTPS for service worker support.
                    // These pages must not have mixed (HTTP/HTTPS) content, so
                    // we disable ads (until the day comes when all ads are HTTPS).
                    if (config.switches.commercial && !config.page.isPreferencesPage) {
                        System['import']('bootstraps/commercial').then(raven.wrap(
                            { tags: { feature: 'commercial' } },
                            function (commercial) {
                                commercial.init();
                            }
                        ));
                    }
                    if (guardian.isModernBrowser) {
                        @if(play.Play.isDev()) {
                            System['import']('bootstraps/dev').then(function (devmode) { devmode.init(); });
                        }
                        System['import']('bootstraps/app').then(function(app) {
                            app.go();
                        });
                    }
                    @if(item.section == "crosswords" || item.id == "offline-page") {
                        System['import']('es6/bootstraps/crosswords').then(function (crosswords) {
                            crosswords.default.init();
                        });
                    }
                });
            });
            @JavaScript(templates.headerInlineJS.js.membershipAccess(item).body)
        });
    });
});

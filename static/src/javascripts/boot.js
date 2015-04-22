/* global guardian, console */

define([
    'raven',
    'common/utils/config',
    'common/modules/experiments/ab',
    'common/modules/ui/images',
    'common/modules/ui/lazy-load-images'
], function (
    raven,
    config,
    ab,
    images,
    lazyLoadImages
) {
    return function (options) {

        var isDev = options.isDev;
        var isDiagnosticsLoggingSwitchOn = options.isDiagnosticsLoggingSwitchOn;

        raven.config(
            'http://' + guardian.config.page.sentryPublicApiKey + '@' + guardian.config.page.sentryHost,
            {
                whitelistUrls: [
                    // will not actually log errors, but `shouldSendCallback` will be called
                    /localhost/,
                    /assets\.guim\.co\.uk/,
                    /ophan\.co\.uk/
                ],
                tags: {
                    edition:        guardian.config.page.edition,
                    contentType:    guardian.config.page.contentType,
                    revisionNumber: guardian.config.page.revisionNumber
                },
                dataCallback: function(data) {
                    if (data.culprit) {
                        data.culprit = data.culprit.replace(/\/[a-z\d]{32}(\/[^\/]+)$/, '$1');
                    }
                    data.tags.origin = (/j.ophan.co.uk/.test(data.culprit)) ? 'ophan' : 'app';
                    return data;
                },
                shouldSendCallback: function(data) {
                    if(isDev) {
                        console.error(data);
                    }

                    return isDiagnosticsLoggingSwitchOn &&
                        Math.random() < 0.2 &&
                        // don't actually notify sentry in dev mode
                        isDev;
                }
            }
        ).install();

        ab.segmentUser();
        ab.run();
        if(guardian.config.page.isFront) {
            if(!document.addEventListener) { // IE8 and below
                window.onload = images.upgradePictures;
            }
        }
        lazyLoadImages.init();
        images.upgradePictures();
        images.listen();

        if (config.switches.commercial) {
            require(['bootstraps/commercial'], function(){
                raven.wrap(
                    { tags: { feature: 'commercial' } },
                    function (commercial) {
                        commercial.init();
                    }
                );
            });
        }

        if (guardian.isModernBrowser) {
            if(isDev) {
                require(['bootstraps/dev'], function (devmode) { devmode.init(); });
            }

            require(['bootstraps/app'], function(bootstrap) {
                bootstrap.go();
            });
        }
    };
});

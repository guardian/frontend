define([
    'raven',
    'common/utils/config',
    'common/utils/detect'
], function (
    raven,
    config,
    detect
) {
    var guardian = window.guardian;

    var app = guardian.app = guardian.app || {};

    var adblockBeingUsed = false;
    detect.adblockInUse.then(function(adblockInUse){
        adblockBeingUsed = adblockInUse;
    });

    // attach raven to global object
    app.raven = raven;

    app.raven.config(
        'https://' + config.page.sentryPublicApiKey + '@' + config.page.sentryHost,
        {
            whitelistUrls: [
                /localhost/, // will not actually log errors, but `shouldSendCallback` will be called
                /assets\.guim\.co\.uk/,
                /ophan\.co\.uk/
            ],
            tags: {
                edition: config.page.edition,
                contentType: config.page.contentType,
                revisionNumber: config.page.revisionNumber
            },
            dataCallback: function (data) {
                if (data.culprit) {
                    data.culprit = data.culprit.replace(/\/[a-z\d]{32}(\/[^\/]+)$/, '$1');
                }
                data.tags.origin = (/j.ophan.co.uk/.test(data.culprit)) ? 'ophan' : 'app';
                return data;
            },
            shouldSendCallback: function (data) {
                var isDev = config.page.isDev;
                var isIgnored = typeof(data.tags.ignored) !== 'undefined' && data.tags.ignored;

                if (isDev && !isIgnored) {
                    // Some environments don't support or don't always expose the console object
                    if (window.console && window.console.warn) {
                        window.console.warn('Raven captured error.', data);
                    }
                }

               return config.switches.enableSentryReporting &&
                Math.random() < 0.1 && !isIgnored && !adblockBeingUsed && !isDev; // don't actually notify sentry in dev mode

            }
        }
    );

    // Report uncaught exceptions
    app.raven.install();

    return app.raven;
});

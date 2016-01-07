// This file is intended to be downloaded and run ASAP on all pages by all
// readers.
//
// While it's ok to run code from here that requires specific host capabilities, it
// should manage failing gracefully by itself.
//
// Assume *nothing* about the host...
//
// This also means you should think *very hard* before adding modules to it,
// in particular 3rd party modules.
//
// For this file, performance and breadth of support should take priority over *anything*…

define([
    'raven',
    'fastdom',
    'common/modules/user-prefs',
    'common/modules/experiments/ab',
    'common/modules/ui/images',
    'common/utils/storage',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/modules/identity/api'
], function (
    raven,
    fastdom,
    userPrefs,
    ab,
    images,
    storage,
    $,
    ajax,
    mediator,
    identity
) {
    return function () {
        var guardian = window.guardian;
        var config = guardian.config;

        //
        // Raven
        //

        raven.config(
            'http://' + config.page.sentryPublicApiKey + '@' + config.page.sentryHost,
            {
                whitelistUrls: [
                    /localhost/, // will not actually log errors, but `shouldSendCallback` will be called
                    /assets\.guim\.co\.uk/,
                    /ophan\.co\.uk/
                ],
                tags: {
                    edition:        config.page.edition,
                    contentType:    config.page.contentType,
                    revisionNumber: config.page.revisionNumber,
                    loaderType:     'Curl'
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
                    if (isDev) {
                        // Some environments don't support or don't always expose the console object
                        if (window.console && window.console.warn) {
                            window.console.warn('Raven captured error.', data);
                        }
                    }

                    return config.switches.diagnosticsLogging &&
                        Math.random() < 0.2 &&
                        !isDev; // don't actually notify sentry in dev mode
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

        //
        // A/B tests
        //

        if (guardian.isModernBrowser) {
            ab.segmentUser();
            ab.run();
        }

        //
        // Images
        //

        if (config.page.isFront) {
            if (!document.addEventListener) { // IE8 and below
                window.onload = images.upgradePictures;
            }
        }
        images.upgradePictures();
        images.listen();

        //
        // set local storage: gu.alreadyVisited
        //

        var alreadyVisted;
        if (guardian.isModernBrowser) {
            alreadyVisted = storage.local.get('gu.alreadyVisited') || 0;
            storage.local.set('gu.alreadyVisited', alreadyVisted + 1);
        }

        // Adds a global window:throttledScroll event to mediator, which throttles
        // scroll events until there's a spare animationFrame.
        // Callbacks of all listeners to window:throttledScroll are run in a
        // fastdom.read, meaning they can all perform DOM reads for free
        // (after the first one that needs layout triggers it).
        // However, this means it's VITAL that all writes in callbacks are delegated to fastdom
        var running = false;
        function onScroll() {
            if (!running) {
                running = true;
                fastdom.read(function () {
                    mediator.emitEvent('window:throttledScroll');
                    running = false;
                });
            }
        }
        window.addEventListener('scroll', userPrefs.get('use-idle-callback') && 'requestIdleCallback' in window ?
            function () {
                window.requestIdleCallback(onScroll);
            } :
            onScroll
        );

        //
        // Membership access
        //

        /**
         * Items with either of the following fields require Membership access
         * - membershipAccess=members-only
         * - membershipAccess=paid-members-only
         */
        // Authenticating requires CORS and withCredentials. If we don't cut the mustard then pass through.
        if (config.page.requiresMembershipAccess) {
            var membershipUrl = config.page.membershipUrl,
                membershipAccess = config.page.membershipAccess,
                requiresPaidTier = (membershipAccess.indexOf('paid-members-only') !== -1),
                membershipAuthUrl = membershipUrl + '/choose-tier?membershipAccess=' + membershipAccess;

            var redirect = function () {
                window.location.href = membershipAuthUrl;
            };

            if (identity.isUserLoggedIn()) {
                ajax({
                    url: membershipUrl + '/user/me',
                    type: 'json',
                    crossOrigin: true,
                    withCredentials: true
                }).then(function (resp) {
                    // Check the users access matches the content
                    var canViewContent = (requiresPaidTier) ? !!resp.tier && resp.isPaidTier : !!resp.tier;
                    if (canViewContent) {
                        $('body').removeClass('has-membership-access-requirement');
                    } else {
                        redirect();
                    }
                }).fail(function () {
                    // If the request fails assume non-member
                    redirect();
                });
            } else {
                redirect();
            }
        }
    };
});

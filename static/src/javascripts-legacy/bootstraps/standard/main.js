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
    'qwery',
    'fastdom',
    'lib/raven',
    'common/modules/user-prefs',
    'common/modules/ui/images',
    'lib/storage',
    'lib/ajax',
    'lib/mediator',
    'lib/check-mediator',
    'lib/add-event-listener',
    'common/modules/identity/api',
    'lib/url',
    'lib/cookies',
    'lib/robust',
    'lib/user-timing',
    'lib/config',
    'common/modules/navigation/newHeaderNavigation',
    'common/modules/analytics/google',
    'lodash/functions/debounce',
    'ophan/ng'
], function (
    qwery,
    fastdom,
    raven,
    userPrefs,
    images,
    storage,
    ajax,
    mediator,
    checkMediator,
    addEventListener,
    identity,
    url,
    cookies,
    robust,
    userTiming,
    config,
    newHeaderNavigation,
    ga,
    debounce,
    ophan
) {
    return function () {
        userTiming.mark('standard start');
        robust.catchErrorsAndLog('ga-user-timing-standard-start', function () {
            ga.trackPerformance('Javascript Load', 'standardStart', 'Standard start parse time');
        });

        var oldOnError = window.onerror;
        window.onerror = function (message, filename, lineno, colno, error) {
            // Not all browsers pass the error object
            if (!error || !error.reported) {
                oldOnError.apply(window, arguments);
            }
        };

        if (config.switches.blockIas && navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(function (swreg) {
                var sw = swreg.active;
                sw.postMessage({ ias: window.location.hash.indexOf('noias') > -1 });
            });
        }

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
        // initilaise the email/outbrain check mediator
        //
        checkMediator.init();

        //
        // Set adtest query if url param declares it.
        //
        var setAdTestCookie = function () {
            var queryParams = url.getUrlVars();
            if (queryParams.adtest === 'clear') {
                cookies.remove('adtest');
            } else if (queryParams.adtest) {
                cookies.add('adtest', encodeURIComponent(queryParams.adtest), 10);
            }
        };
        setAdTestCookie();


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

        var alreadyVisited;
        if (window.guardian.isEnhanced) {
            alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;
            storage.local.set('gu.alreadyVisited', alreadyVisited + 1);
        }

        // Add global pooled event listeners
        // CAUTION: those are *passive*, which means calls to event.preventDefault
        // will be ignored

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
        addEventListener(window, 'scroll', userPrefs.get('use-idle-callback') && 'requestIdleCallback' in window ?
            function () {
                window.requestIdleCallback(onScroll);
            } :
            onScroll,
            { passive: true }
        );

        // Adds a global window:throttledResize event to mediator, which debounces events
        // until the user has stopped resizing the window for a reasonable amount of time.
        function onResize(evt) {
            mediator.emitEvent('window:throttledResize', [evt]);
        }
        addEventListener(window, 'resize', debounce(onResize, 200), { passive: true });

        ophan.setEventEmitter(mediator);

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
                membershipAuthUrl = membershipUrl + '/membership-content?referringContent=' + config.page.contentId + '&membershipAccess=' + membershipAccess;

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
                        fastdom.write(function () {
                            document.body.classList.remove('has-membership-access-requirement');
                        });
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

        /**
         * Initialise Identity module
         */
        identity.init();

        // show hiring message if we're in a very modern browser
        try { // this should never interfere with anything, so `try` it
            if ('repeat' in String.prototype && !config.page.isDev) {
                window.console.log(
                    '\n' +
                    '%cHello.\n' +
                    '\n' +
                    '%cWe are hiring – ever thought about joining us? \n' +
                    '%chttp://developers.theguardian.com/join-the-team.html%c \n' +
                    '\n',
                    'font-family: Georgia, serif; font-size: 32px; color: #005689',
                    'font-family: Georgia, serif; font-size: 16px; color: #767676',
                    'font-family: Helvetica Neue, sans-serif; font-size: 11px; text-decoration: underline; line-height: 1.2rem; color: #767676',
                    ''
                );
            }
        } catch (e) {
            // do nothing
        }

        /**
         *  New Header Navigation
         */
        newHeaderNavigation();



        userTiming.mark('standard end');
        robust.catchErrorsAndLog('ga-user-timing-standard-end', function () {
            ga.trackPerformance('Javascript Load', 'standardEnd', 'Standard end parse time');
        });
    };
});

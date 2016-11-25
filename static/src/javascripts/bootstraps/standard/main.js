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
    'common/utils/raven',
    'common/modules/user-prefs',
    'common/modules/ui/images',
    'common/utils/storage',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/modules/identity/api',
    'common/utils/url',
    'common/utils/cookies',
    'common/utils/robust',
    'common/utils/user-timing',
    'common/modules/navigation/newHeaderNavigation'
], function (
    qwery,
    fastdom,
    raven,
    userPrefs,
    images,
    storage,
    ajax,
    mediator,
    identity,
    url,
    cookies,
    robust,
    userTiming,
    newHeaderNavigation
) {
    return function () {
        var guardian = window.guardian;
        var config = guardian.config;

        userTiming.mark('standard start');

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

        /*
         *  Interactive bootstraps.
         *
         *  Interactives are content, we want them booting as soon (and as stable) as possible.
         */

        if (!config.switches.abWebpack && /Article|LiveBlog/.test(config.page.contentType)) {
            qwery('figure.interactive').forEach(function (el) {
                var mainJS = el.getAttribute('data-interactive');
                if (!mainJS) {
                    return;
                }

                require([mainJS], function (interactive) {
                    fastdom.defer(function () {
                        robust.catchErrorsAndLog('interactive-bootstrap', function () {
                            interactive.boot(el, document, config, mediator);
                        });
                    });
                });

                require(['ophan/ng'], function(ophan) {
                    var a = el.querySelector('a');
                    var href = a && a.href;

                    if (href) {
                        ophan.trackComponentAttention(href, el);
                    }
                });
            });

            qwery('iframe.interactive-atom-fence').forEach(function (el) {
                var srcdoc;
                if (!el.srcdoc) {
                    fastdom.read(function () {
                       srcdoc = el.getAttribute('srcdoc');
                    });
                    fastdom.write(function () {
                        el.contentWindow.contents = srcdoc;
                        el.src = 'javascript:window["contents"]';
                    });
                }
            });
        }

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
        if (guardian.isEnhanced) {
            alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;
            storage.local.set('gu.alreadyVisited', alreadyVisited + 1);
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

        require(['ophan/ng'], function(ophan) {
            ophan.setEventEmitter(mediator);
        });

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
    };
});

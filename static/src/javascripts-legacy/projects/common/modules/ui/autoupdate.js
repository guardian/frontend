/*
    Module: autoupdate.js
    Description: Used to load update fragments of the DOM from specfied endpoint
*/
define([
    'lib/fastdom-promise',
    'bean',
    'bonzo',
    'qwery',
    'lib/$',
    'lib/fetch-json',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'common/modules/article/twitter',
    'lodash/objects/assign',
    'common/modules/ui/sticky',
    'lib/scroller',
    'lodash/collections/toArray',
    'common/modules/ui/relativedates',
    'common/modules/ui/notification-counter',
    'common/modules/atoms/youtube'
], function (
    fastdom,
    bean,
    bonzo,
    qwery,
    $,
    fetchJSON,
    config,
    detect,
    mediator,
    twitter,
    assign,
    sticky,
    scroller,
    toArray,
    RelativeDates,
    NotificationCounter,
    youtube
) {

    return function (opts) {
        var options = assign({
            'toastOffsetTop': 12, // pixels from the top
            'minUpdateDelay': (detect.isBreakpoint({ min: 'desktop' }) ? 10 : 30) * 1000, // 10 or 30 seconds minimum, depending on breakpoint
            'maxUpdateDelay': 20 * 60 * 1000, // 20 mins
            'backoffMultiplier': 0.75 // increase or decrease the back off rate by modifying this
        }, opts);

        // Cache selectors
        var $liveblogBody = $('.js-liveblog-body');
        var $toastButton = $('.toast__button');
        var $toastText = $('.toast__text', this.$toastButton);
        var toastContainer = qwery('.toast__container')[0];

        // Warning: these are re-assigned over time
        var currentUpdateDelay = options.minUpdateDelay;
        var latestBlockId = $liveblogBody.data('most-recent-block');
        var unreadBlocksNo = 0;
        var updateTimeoutId = undefined;


        var updateDelay = function (delay) {
            var newDelay;
            if (detect.pageVisible()) {
                newDelay = options.minUpdateDelay;
            } else {
                newDelay = Math.min(delay * 1.5, options.maxUpdateDelay);
            }
            currentUpdateDelay = newDelay;
        };

        var scrolledPastTopBlock = function () {
            return $liveblogBody.offset().top < window.pageYOffset;
        };
        var isLivePage = window.location.search.indexOf('?page=') === -1;

        var revealInjectedElements = function () {
            fastdom.write(function () {
                $('.autoupdate--hidden', $liveblogBody).addClass('autoupdate--highlight').removeClass('autoupdate--hidden');
                mediator.emit('modules:autoupdate:unread', 0);
            });
        };

        var toastButtonRefresh = function () {
            fastdom.write(function () {
                if (unreadBlocksNo > 0) {
                    var updateText = (unreadBlocksNo > 1) ? ' new updates' : ' new update';
                    $toastButton.removeClass('toast__button--closed');
                    $(toastContainer).addClass('toast__container--open');
                    $toastText.html(unreadBlocksNo + updateText);
                } else {
                    $toastButton.removeClass('loading').addClass('toast__button--closed');
                    $(toastContainer).removeClass('toast__container--open');
                }
            });
        };

        var injectNewBlocks = function (newBlocks) {
            // Clean up blocks before insertion
            var resultHtml = $.create('<div>' + newBlocks + '</div>')[0];
            var elementsToAdd;

            fastdom.write(function () {
                bonzo(resultHtml.children).addClass('autoupdate--hidden');
                elementsToAdd = toArray(resultHtml.children);

                // Insert new blocks
                $liveblogBody.prepend(elementsToAdd);

                mediator.emit('modules:autoupdate:updates', elementsToAdd.length);

                RelativeDates.init();
                twitter.enhanceTweets();
                youtube.checkElemsForVideos(elementsToAdd);
            });
        };

        var displayNewBlocks = function () {
            if (detect.pageVisible()) {
                revealInjectedElements();
            }

            unreadBlocksNo = 0;
            toastButtonRefresh();
        };

        var checkForUpdates = function () {

            if (updateTimeoutId != undefined) {
                clearTimeout(updateTimeoutId);
            }

            var shouldFetchBlocks = '&isLivePage=' + (isLivePage ? 'true' : 'false');
            var latestBlockIdToUse = ((latestBlockId) ? latestBlockId : 'block-0');
            var count = 0;
            var endpoint = window.location.pathname + '.json?lastUpdate=' + latestBlockIdToUse + shouldFetchBlocks;

            // #? One day this should be in Promise.finally()
            var setUpdateDelay = function() {
                if (count == 0 || currentUpdateDelay > 0) {
                    updateDelay(currentUpdateDelay);
                    updateTimeoutId = setTimeout(checkForUpdates, currentUpdateDelay);
                } else {
                    // might have been cached so check straight away
                    updateTimeoutId = setTimeout(checkForUpdates, 1);
                }
            };

            return fetchJSON(endpoint, {
                mode: 'cors',
            }).then(function (resp) {
                count = resp.numNewBlocks;

                if (count > 0) {
                    unreadBlocksNo += count;

                    // updates notification bar with number of unread blocks
                    mediator.emit('modules:autoupdate:unread', unreadBlocksNo);

                    latestBlockId = resp.mostRecentBlockId;

                    if (isLivePage) {
                        injectNewBlocks(resp.html);
                        if (scrolledPastTopBlock()) {
                            toastButtonRefresh();
                        } else {
                            displayNewBlocks();
                        }
                    } else {
                        toastButtonRefresh();
                    }
                }

                setUpdateDelay();
            }).catch(function() {
                setUpdateDelay();
            });
        };

        var setUpListeners = function () {
            bean.on(document.body, 'click', '.toast__button', function () {
                if (isLivePage) {
                    fastdom.read(function () {
                        scroller.scrollToElement(qwery('.blocks')[0], 300, 'easeOutQuad');

                        fastdom.write(function () {
                            $toastButton.addClass('loading');
                        }).then(function () {
                            displayNewBlocks();
                        });
                    });
                } else {
                    location.assign(window.location.pathname);
                }
            });

            mediator.on('modules:toast__tofix:unfixed', function () {
                if (isLivePage && unreadBlocksNo > 0) {
                    fastdom.write(function () {
                        $toastButton.addClass('loading');
                    }).then(function () {
                        displayNewBlocks();
                    });
                }
            });

            mediator.on('modules:detect:pagevisibility:visible', function () {
                if (unreadBlocksNo == 0) {
                    revealInjectedElements();
                }
                currentUpdateDelay = 0; // means please get us fully up to date
                checkForUpdates();
            });
        };

        //
        // init
        //

        new NotificationCounter().init();
        new sticky.Sticky(toastContainer, { top: options.toastOffsetTop, emitMessage: true, containInParent: false }).init();

        checkForUpdates();
        detect.initPageVisibility();
        setUpListeners();

        fastdom.write(function () {
            // Enables the animations for injected blocks
            $liveblogBody.addClass('autoupdate--has-animation');
        });
    };
});

/*
    Module: autoupdate.js
    Description: Used to load update fragments of the DOM from specfied endpoint
*/
define([
    'common/utils/fastdom-promise',
    'bean',
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/twitter',
    'common/modules/live/notification-bar',
    'lodash/objects/assign',
    'common/modules/ui/sticky',
    'common/utils/scroller',
    'lodash/collections/toArray',
    'lodash/functions/bindAll',
    'common/modules/ui/relativedates',
    'common/modules/ui/notification-counter'
], function (
    fastdom,
    bean,
    bonzo,
    qwery,
    $,
    ajax,
    config,
    detect,
    mediator,
    twitter,
    NotificationBar,
    assign,
    Sticky,
    scroller,
    toArray,
    bindAll,
    RelativeDates,
    NotificationCounter
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

            return ajax({
                url: window.location.pathname + '.json?lastUpdate=' + latestBlockIdToUse + shouldFetchBlocks,
                type: 'json',
                method: 'get',
                crossOrigin: true
            }).then(function (resp) {
                var count = resp.numNewBlocks;

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
            }).always(function () {
                updateDelay(currentUpdateDelay);
                updateTimeoutId = setTimeout(checkForUpdates, currentUpdateDelay);
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
                currentUpdateDelay = options.minUpdateDelay;
                checkForUpdates();
            });
        };

        //
        // init
        //

        new NotificationCounter().init();
        new Sticky(toastContainer, { top: options.toastOffsetTop, emitMessage: true, containInParent: false }).init();

        checkForUpdates();
        detect.initPageVisibility();
        setUpListeners();

        fastdom.write(function () {
            // Enables the animations for injected blocks
            $liveblogBody.addClass('autoupdate--has-animation');
        });
    };
});

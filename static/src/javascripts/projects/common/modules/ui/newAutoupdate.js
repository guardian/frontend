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
    NotificationCounter) {

    return function (opts) {
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
            return $liveblogBody.offset().top < window.scrollY;
        };
        var isLivePage = !(window.location.href.search('[?&]page=') !== -1);


        var setUpListeners = function () {
            bean.on(document.body, 'click', '.toast__button', function () {
                if (isLivePage) {
                    fastdom.read(function () {
                        scroller.scrollToElement(qwery('.block')[0], 300, 'easeOutQuad');

                        fastdom.write(function () {
                            $toastButton.addClass('loading');
                        }).then(function () {
                            injectNewBlocks();
                        });
                    });
                } else {
                    location.assign(window.location.pathname);
                }
            });

            mediator.on('modules:toast__tofix:unfixed', function () {
                if (isLivePage) {
                    fastdom.write(function () {
                        $toastButton.addClass('loading');
                    }).then(function () {
                        injectNewBlocks();
                    });
                }
            });

            mediator.on('modules:detect:pagevisibility:visible', function () {
                revealInjectedElements();
                currentUpdateDelay = options.minUpdateDelay;
            });
        };

        var checkForUpdates = function () {
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
                    // updates notification bar with number of unread blocks
                    mediator.emit('modules:autoupdate:unread', count);

                    if (isLivePage) {
                        newBlocks = resp.html;
                        if (scrolledPastTopBlock()) {
                            toastButtonRefresh(count);
                        } else {
                            injectNewBlocks();
                        }
                    } else {
                        toastButtonRefresh(count);
                    }
                }
            }).then(function () {
                updateDelay(currentUpdateDelay);
                console.log(currentUpdateDelay);
                setTimeout(checkForUpdates, currentUpdateDelay);
            });
        };

        var toastButtonRefresh = function (count) {
            fastdom.write(function () {
                if (count > 0) {
                    var updateText = (count > 1) ? ' new updates' : ' new update';
                    $toastButton.removeClass('toast__button--closed').addClass('toast__button--open');
                    $toastText.html(count + updateText);
                    $toastSpaceReserver.addClass('toast__space-reserver--open');
                } else {
                    $toastButton.removeClass('toast__button--open').removeClass('loading').addClass('toast__button--closed');
                    $toastSpaceReserver.removeClass('toast__space-reserver--open');
                }
            });
        };

        var injectNewBlocks = function () {
            if (!updating && newBlocks) {
                updating = true;
                // Clean up blocks before insertion
                var resultHtml = $.create('<div>' + newBlocks + '</div>')[0];
                var elementsToAdd;

                fastdom.write(function () {
                    bonzo(resultHtml.children).addClass('autoupdate--hidden');
                    elementsToAdd = toArray(resultHtml.children);

                    // Insert new blocks and animate
                    $toastSpaceReserver.after(elementsToAdd);

                    if (detect.pageVisible()) {
                        revealInjectedElements();
                    }

                    toastButtonRefresh(0);

                    console.log(elementsToAdd.length);

                    mediator.emit('modules:autoupdate:updates', elementsToAdd.length);

                    latestBlockId = $('.block').first().attr('id');

                    newBlocks = '';

                    RelativeDates.init();
                    twitter.enhanceTweets();
                }).then(function () {
                    updating = false;
                });
            }
        };

        var revealInjectedElements = function () {
            fastdom.write(function () {
                $('.autoupdate--hidden', $liveblogBody).addClass('autoupdate--highlight').removeClass('autoupdate--hidden');
                mediator.emit('modules:autoupdate:unread', 0);
            });
        };

        //
        // init
        //

        var options = assign({
            'toastOffsetTop': 12, // pixels from the top
            'minUpdateDelay': (detect.isBreakpoint({ min: 'desktop' }) ? 10 : 30) * 1000, // 10 or 30 seconds minimum, depending on breakpoint
            'maxUpdateDelay': 20 * 60 * 1000, // 20 mins
            'backoffMultiplier': 0.75 // increase or decrease the back off rate by modifying this
        }, opts);

        var newBlocks;
        var currentUpdateDelay = options.minUpdateDelay;
        var latestBlockId;
        var updating = false;

        // Cache selectors
        var $liveblogBody = $('.js-liveblog-body');
        var $toastButton = $('.toast__button');
        var $toastSpaceReserver = $('.toast__space-reserver');
        var $toastText = $('.toast__text', this.$toastButton);
        var toastContainer = qwery('.toast__container')[0];

        //latestBlockId = $liveblogBody.data('most-recent-block');

        latestBlockId = $(".block")[1].id;

        new NotificationCounter().init();
        new Sticky(toastContainer, { top: options.toastOffsetTop, emitMessage: true, containInParent: false }).init();

        checkForUpdates();
        detect.initPageVisibility();
        setUpListeners();

        fastdom.write(function () {
            // Enables the animations for injected blocks
            $liveblogBody.addClass('autoupdate--has-animation toast-enabled');
            $('.js-live-toolbar').remove(); // only necessary in the AB test
        });
    };
});

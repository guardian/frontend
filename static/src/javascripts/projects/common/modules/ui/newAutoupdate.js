/*
    Module: autoupdate.js
    Description: Used to load update fragments of the DOM from specfied endpoint
*/
define([
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
    'common/modules/ui/simpleSticky',
    'common/utils/scroller',
    'lodash/collections/toArray',
    'lodash/functions/bindAll',
    'common/modules/ui/relativedates',
    'common/modules/ui/notification-counter',
    'common/modules/article/twitter'
], function (
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
    NotificationCounter,
    twitter) {

    return function (opts) {
        var options = assign({
            'updateDelay': 10000
        }, opts);

        // Cache selectors
        var $liveblogBody = $('.js-liveblog-body');
        var $updateBox = $('.js-updates-button');
        var $updateBoxContainer = $('.blog__updates-box-container');
        var $updateBoxText = $('.blog__updates-box-text', this.$updateBox);

        // Enables the animations for injected blocks
        $liveblogBody.addClass('autoupdate--has-animation');

        var scrolledPastTopBlock = function () {
            return $liveblogBody.offset().top < window.scrollY;
        };
        var isLivePage = !(window.location.href.search("[?&]page=") !== -1);

        //var latestBlockId = this.$liveblogBody.data('most-recent-block');
        var penultimate = $($('.block')[1]).attr('id'); // TO REMOVE AFTER TESTING
        var latestBlockId = penultimate;
        var toastOffsetTop = 12; // pixels from the top

        var newBlocks;

        var setUpListeners = function () {
            bean.on(document.body, 'click', '.js-updates-button', function () {
                if(isLivePage) {
                    scroller.scrollToElement(qwery('.js-blog-blocks'), 300, 'easeOutQuad');
                    $updateBox.addClass('loading');
                    injectNewBlocks();
                } else {
                    location.assign(window.location.pathname);
                }
            });

            mediator.on('modules:liveblog-updates-button:unfixed', function () {
                if(isLivePage) {
                    $updateBox.addClass('loading');
                    injectNewBlocks();
                }
            });

            mediator.on('modules:detect:pagevisibility:visible', function () {
                revealInjectedElements();
            });
        };

        var checkForUpdates = function () {
            var shouldFetchBlocks = '&showBlocks=' + (isLivePage ? 'true' : 'false');
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
                        console.log(scrolledPastTopBlock());
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
                setTimeout(checkForUpdates, options.updateDelay);
            });
        };

        var toastButtonRefresh = function (count) {
            if (count > 0) {
                var updateText = (count > 1) ? ' new updates' : ' new update';
                $updateBox.removeClass('blog__updates-box--closed').addClass('blog__updates-box--open');
                $updateBoxText.html(count + updateText);
                $updateBoxContainer.addClass('blog__updates-box-container--open');
            } else {
                $updateBox.removeClass('blog__updates-box--open').removeClass('loading').addClass('blog__updates-box--closed');
                $updateBoxContainer.removeClass('blog__updates-box-container--open');
            }
        };

        var injectNewBlocks = function () {
            if (newBlocks) {
                // Clean up blocks before insertion
                var resultHtml = $.create('<div>' + newBlocks + '</div>')[0];
                var elementsToAdd;

                bonzo(resultHtml.children).addClass('autoupdate--hidden');
                elementsToAdd = toArray(resultHtml.children);

                // Insert new blocks and animate
                $('.blog__updates-box-container').after(elementsToAdd);

                if (detect.pageVisible()) {
                    revealInjectedElements();
                }

                latestBlockId = $('.block').first().attr('id');

                newBlocks = '';

                RelativeDates.init();
                twitter.enhanceTweets();

                setTimeout(function () {
                    toastButtonRefresh(0);
                }, 600);
            }
        };

        var revealInjectedElements = function () {
            $('.autoupdate--hidden', $liveblogBody).addClass('autoupdate--highlight').removeClass('autoupdate--hidden');
            mediator.emit('modules:autoupdate:unread', 0);
        };

        // init
        detect.initPageVisibility();
        setUpListeners();
        checkForUpdates();

        new NotificationCounter().init();
        new Sticky(qwery('.blog__updates-box-tofix'), { top: toastOffsetTop, emit: true }).init();
    };
});

define([
    'bean',
    'bonzo',
    'qwery',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/scroller',
    'common/utils/template',
    'common/utils/url',
    'common/modules/accessibility/helpers',
    'common/modules/article/rich-links',
    'common/modules/live/filter',
    'common/modules/commercial/liveblog-adverts',
    'common/modules/commercial/liveblog-dynamic-adverts',
    'common/modules/experiments/affix',
    'common/modules/ui/autoupdate',
    'common/modules/ui/newAutoupdate',
    'common/modules/ui/dropdowns',
    'common/modules/ui/last-modified',
    'common/modules/ui/notification-counter',
    'common/modules/ui/relativedates',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail',
    'common/utils/robust',
    'common/modules/experiments/ab'
], function (
    bean,
    bonzo,
    qwery,
    fastdom,
    $,
    config,
    detect,
    mediator,
    scroller,
    template,
    url,
    accessibility,
    richLinks,
    LiveFilter,
    liveblogAdverts,
    liveblogDynamicAdverts,
    Affix,
    AutoUpdate,
    AutoUpdateNew,
    dropdowns,
    lastModified,
    NotificationCounter,
    RelativeDates,
    articleLiveblogCommon,
    trail,
    robust,
    ab) {
    'use strict';

    var modules,
        autoUpdate;

    function createScrollTransitions() {

        var curBinding,
            timeline      = qwery('.timeline')[0],
            selectedClass = 'live-blog__key-event--selected';

        function unselect() {
            fastdom.write(function () {
                $('.' + selectedClass).removeClass(selectedClass);
            });
        }

        function unselectOnScroll() {
            bean.off(curBinding);
            curBinding = mediator.once('window:throttledScroll', unselect);
        }

        bean.on(document.body, 'click', 'a', function (e) {
            var id = e.currentTarget.href.match(/.*(#.*)/);
            if (id && $(id[1]).hasClass('truncated-block')) {
                mediator.emit('module:liveblog:showkeyevents', true);
            }
        });

        if (timeline) {
            bean.on(timeline, 'click', '.timeline__link', function (e) {
                mediator.emit('module:liveblog:showkeyevents', true);
                $('.dropdown--live-feed').addClass('dropdown--active');
                var $el = bonzo(e.currentTarget),
                    eventId = $el.attr('data-event-id'),
                    title = $('.timeline__title', $el).text(),
                    targetEl = qwery('#' + eventId),
                    dim = bonzo(targetEl).offset(),
                    duration = 500,
                    slimHeaderHeight = 52,
                    topPadding = 12,
                    scrollAmount;

                scrollAmount = config.switches.viewability ? dim.top - slimHeaderHeight : dim.top - topPadding;
                scroller.scrollTo(scrollAmount, duration, 'easeOutQuint');
                window.setTimeout(unselectOnScroll, 550);
                bean.off(curBinding);
                unselect();
                $el.addClass(selectedClass);
                url.pushUrl({blockId: eventId}, title, window.location.pathname + '#' + eventId, true);
                e.stop();
            });
        }
    }

    function getUpdatePath() {
        var id,
            blocks = qwery('.js-liveblog-body .block'),
            newestBlock = blocks.shift();

        // There may be no blocks at all. 'block-0' will return any new blocks found.
        id = newestBlock ? newestBlock.id : 'block-0';
        return window.location.pathname + '.json?lastUpdate=' + id;
    }

    modules = {
        initAdverts: function () {
            if (config.switches.liveblogDynamicAdverts) {
                liveblogDynamicAdverts.init();
            } else if (config.switches.liveblogAdverts) {
                liveblogAdverts.init();
            }
        },

        createFilter: function () {
            //new LiveFilter($('.js-blog-blocks')[0]).ready();
            if (!ab.isInVariant('LiveblogToast', 'toast')) {
                console.log('foo');
                new LiveFilter($('.js-blog-blocks')[0]).ready();
                new NotificationCounter().init();
            }
        },

        affixTimeline: function () {
            var topMarker;
            if (detect.isBreakpoint({ min: 'desktop' }) && config.page.keywordIds.indexOf('football/football') < 0 && config.page.keywordIds.indexOf('sport/rugby-union') < 0) {
                topMarker = qwery('.js-top-marker')[0];
                /*eslint-disable no-new*/
                new Affix({
                    element: qwery('.js-live-blog__timeline-container')[0],
                    topMarker: topMarker,
                    bottomMarker: qwery('.js-bottom-marker')[0],
                    containerElement: qwery('.js-live-blog__key-events')[0]
                });
                /*eslint-enable no-new*/
            }
            createScrollTransitions();
        },

        createAutoUpdate: function () {
            if (config.page.isLive) {
                if (ab.isInVariant('LiveblogToast', 'toast')) {
                    AutoUpdateNew();
                } else {
                    var timerDelay = detect.isBreakpoint({ min: 'desktop' }) ? 5000 : 60000;
                    autoUpdate = new AutoUpdate({
                        path: getUpdatePath,
                        delay: timerDelay,
                        backoff: 2,
                        backoffMax: 1000 * 60 * 20,
                        attachTo: $('.js-liveblog-body')[0],
                        switches: config.switches,
                        manipulationType: 'prepend'
                    });
                    autoUpdate.init();
                }
            }

        },

        keepTimestampsCurrent: function () {
            var dates = RelativeDates;
            window.setInterval(
                function () {
                    dates.init();
                },
                60000
            );
        },

        accessibility: function () {
            accessibility.shouldHideFlashingElements();
        }
    };

    function ready() {
        robust.catchErrorsAndLogAll([
            ['lb-a11y',       modules.accessibility],
            ['lb-adverts',    modules.initAdverts],
            ['lb-autoupdate', modules.createAutoUpdate],
            ['lb-timeline',   modules.affixTimeline],
            ['lb-filter',     modules.createFilter],
            ['lb-timestamp',  modules.keepTimestampsCurrent],
            ['lb-richlinks',  richLinks.upgradeRichLinks]
        ]);

        trail();
        articleLiveblogCommon();

        robust.catchErrorsAndLog('lb-ready',   function () { mediator.emit('page:liveblog:ready'); });
    }

    return {
        init: ready
    };
});

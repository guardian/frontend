define([
    'bean',
    'bonzo',
    'qwery',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/accessibility/helpers',
    'common/modules/article/rich-links',
    'common/modules/commercial/liveblog-adverts',
    'common/modules/commercial/liveblog-dynamic-adverts',
    'common/modules/experiments/affix',
    'common/modules/ui/autoupdate',
    'common/modules/ui/newAutoupdate',
    'common/modules/ui/notification-counter',
    'common/modules/ui/relativedates',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail',
    'common/utils/robust'
], function (
    bean,
    bonzo,
    qwery,
    fastdom,
    $,
    config,
    detect,
    mediator,
    accessibility,
    richLinks,
    liveblogAdverts,
    liveblogDynamicAdverts,
    Affix,
    AutoUpdate,
    AutoUpdateNew,
    NotificationCounter,
    RelativeDates,
    articleLiveblogCommon,
    trail,
    robust
) {
    'use strict';

    var modules,
        autoUpdate;

    function getUpdatePath() {
        var id,
            blocks = qwery('.js-liveblog-body .block'),
            newestBlock = blocks.shift();

        // There may be no blocks at all. 'block-0' will return any new blocks found.
        id = newestBlock ? newestBlock.id : 'block-0';
        return window.location.pathname + '.json?isLivePage=true&lastUpdate=' + id;
    }

    modules = {
        initAdverts: function () {
            if (config.switches.liveblogDynamicAdverts) {
                liveblogDynamicAdverts.init();
            } else if (config.switches.liveblogAdverts) {
                liveblogAdverts.init();
            }
        },

        // once Toast is shipped this can be removed completely, the notification counter is initialised within Toast
        createFilter: function () {
            if (!config.switches.liveblogToast) {
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
        },

        createAutoUpdate: function () {
            if (config.page.isLive) {
                if (config.switches.liveblogToast) {
                    AutoUpdateNew();
                } else if (window.location.search.indexOf('?page=') !== 0/*TODO proper guardian.config val*/) {
                    var timerDelay = detect.isBreakpoint({ min: 'desktop' }) ? 5000 : 60000;
                    autoUpdate = new AutoUpdate({
                        path: getUpdatePath,
                        delay: timerDelay,
                        backoff: 2,
                        backoffMax: 1000 * 60 * 20,
                        attachTo: [$('.js-liveblog-body')[0], $('.js-live-blog__timeline')[0]],
                        switches: config.switches,
                        manipulationType: 'prepend',
                        responseField: ['html', 'timeline']
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

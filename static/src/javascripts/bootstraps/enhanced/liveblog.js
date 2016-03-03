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
    NotificationCounter,
    RelativeDates,
    articleLiveblogCommon,
    trail,
    robust
) {
    'use strict';

    var modules;

    modules = {
        initAdverts: function () {
            if (config.switches.liveblogDynamicAdverts) {
                liveblogDynamicAdverts.init();
            } else if (config.switches.liveblogAdverts) {
                liveblogAdverts.init();
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
                AutoUpdate();
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

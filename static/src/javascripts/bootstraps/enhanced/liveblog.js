define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/rich-links',
    'common/modules/commercial/liveblog-adverts',
    'common/modules/experiments/affix',
    'common/modules/ui/autoupdate',
    'common/modules/ui/notification-counter',
    'common/modules/ui/relativedates',
    'common/modules/experiments/ab',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail',
    'bootstraps/enhanced/notifications',
    'common/utils/robust'
], function (
    config,
    detect,
    mediator,
    richLinks,
    liveblogAdverts,
    Affix,
    AutoUpdate,
    NotificationCounter,
    RelativeDates,
    ab,
    articleLiveblogCommon,
    trail,
    notifications,
    robust
) {
    'use strict';

    var modules;

    modules = {
        initAdverts: function () {
            return liveblogAdverts.init();
        },

        affixTimeline: function () {
            var topMarker;
            if (detect.isBreakpoint({ min: 'desktop' }) && config.page.keywordIds.indexOf('football/football') < 0 && config.page.keywordIds.indexOf('sport/rugby-union') < 0) {
                topMarker = document.querySelector('.js-top-marker');
                new Affix({
                    element: document.querySelector('.js-live-blog__sticky-components-container'),
                    topMarker: topMarker,
                    bottomMarker: document.querySelector('.js-bottom-marker'),
                    containerElement: document.querySelector('.js-live-blog__sticky-components')
                });
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

        initNotifications: function() {
            if (ab.isInVariant('LiveBlogChromeNotificationsProd2', 'show-notifications')
                && (window.location.protocol === 'https:' ||  window.location.hash === '#force-sw')
                && detect.getUserAgent.browser === 'Chrome' && config.page.isLive) {
                    notifications.init();
            }
        }
    };

    function ready() {
        robust.catchErrorsAndLogAll([
            ['lb-adverts',    modules.initAdverts],
            ['lb-autoupdate', modules.createAutoUpdate],
            ['lb-timeline',   modules.affixTimeline],
            ['lb-timestamp',  modules.keepTimestampsCurrent],
            ['lb-notifications',  modules.initNotifications],
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

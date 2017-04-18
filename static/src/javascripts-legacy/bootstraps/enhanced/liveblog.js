define([
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'common/modules/article/rich-links',
    'common/modules/experiments/affix',
    'common/modules/ui/autoupdate',
    'common/modules/ui/notification-counter',
    'common/modules/ui/relativedates',
    'common/modules/experiments/ab',
    'bootstraps/enhanced/article-liveblog-common',
    'bootstraps/enhanced/trail',
    'bootstraps/enhanced/notifications',
    'lib/robust'
], function (
    config,
    detect,
    mediator,
    richLinks,
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

        notificationsCondition: function() {
            return (config.switches.liveBlogChromeNotificationsProd
            && !detect.isIOS()
            && (window.location.protocol === 'https:' ||  window.location.hash === '#force-sw')
            && detect.getUserAgent.browser === 'Chrome'
            && config.page.isLive);
        },

        initNotifications: function() {
            if (modules.notificationsCondition()) {
                    notifications.init();
            }
        }
    };

    function ready() {
        robust.catchErrorsWithContext([
            ['lb-autoupdate', modules.createAutoUpdate],
            ['lb-timeline',   modules.affixTimeline],
            ['lb-timestamp',  modules.keepTimestampsCurrent],
            ['lb-notifications',  modules.initNotifications],
            ['lb-richlinks',  richLinks.upgradeRichLinks]
        ]);

        trail();
        articleLiveblogCommon();

        robust.catchErrorsWithContext([
            ['lb-ready', function () { mediator.emit('page:liveblog:ready'); }],
        ]);
    }

    return {
        init: ready,
        notificationsCondition: modules.notificationsCondition
    };
});

define([
    'bonzo',
    'qwery',
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/ajax',
    'common/utils/robust',
    'common/views/svgs',
    'common/modules/user-prefs',
    'template!common/views/ui/notifications-follow-link.html',
    'template!common/views/ui/notifications-explainer.html',
    'template!common/views/ui/notifications-permission-denied-message.html',
    'lodash/collections/some',
    'lodash/arrays/uniq',
    'lodash/arrays/without'
], function (
    bonzo,
    qwery,
    bean,
    fastdom,
    $,
    config,
    storage,
    ajax,
    robust,
    svgs,
    userPrefs,
    followLink,
    explainer,
    permissionsTemplate,
    some,
    uniq,
    without
) {
    var explainerDismissed = 'gu.notificationsExplainerDismissed',
        modules = {

        getReg: function () {
            return navigator.serviceWorker.ready;
        },

        getSub: function () {
            return modules.getReg().then(function (reg) {return reg.pushManager.getSubscription();});
        },

        init: function() {
            modules.configureSubscribeButton();
            if(!modules.hasSubscribed() && !modules.hasDismissedExplainer()) {
                modules.showExplainer();
            }
        },

        configureSubscribeButton: function () {
            var $follow = bonzo($('.js-live-notifications')),
                isSsubscribed = modules.checkSubscriptions(),
                handler = isSsubscribed ? modules.unSubscribeHandler : modules.subscribeHandler,
                src = followLink({
                    isSubscribed: isSsubscribed,
                    icon: svgs(isSsubscribed ? 'notificationsOff' : 'notificationsOn')
                });

            fastdom.write( function() {
                $follow.html(src);
                bean.one($follow[0], 'click', '.js-notifications__button', handler);
            });
        },

        showExplainer: function() {
            var src = explainer({
                closeIcon : svgs('closeCentralIcon'),
                imgMobile: svgs('notificationsExplainerMobile', ['mobile-only', 'live-notifications-explainer-svg']),
                imgDesktop: svgs('notificationsExplainerDesktop', ['hide-on-mobile', 'live-notifications-explainer-svg'])
            });

            fastdom.write(function () {
                var $notifications = $('.js-live-notifications');
                $notifications.append(src);
               // bean.one($notifications[0], 'click', '.js-live-notifications__item__close', function() {
                bean.one($('.js-live-notifications__item__close')[0], 'click', function() {
                    fastdom.write(function() {
                        userPrefs.set(explainerDismissed, true);
                        $('.js-live-notifications-explainer').remove();
                    });
                });
            });
        },

        closeDisplayMessage: function(){
            $('.js-live-notifications-denied').remove();
            bean.one($('.js-live-notifications')[0], 'click', '.js-notifications__button', modules.subscribeHandler);
        },

        notificationsDeniedMessage: function() {
            var src = permissionsTemplate({closeIcon : svgs('closeCentralIcon')});
            fastdom.write(function () {
                var blocked = $('.js-notifications-blocked');
                blocked.prepend(src);
                bean.one(blocked[0], 'click', '.js-live-notifications-denied__item__close', modules.closeDisplayMessage);
            });
        },

        subscribeHandler: function () {
            modules.subscribe().then(modules.follow)
                .catch( function () {
                    if (Notification.permission === 'denied') {
                        modules.notificationsDeniedMessage();
                    }
                });
        },

        unSubscribeHandler: function () {
            modules.unFollow().then(modules.unSubscribe);
        },

        subscribe: function () {
            return modules.getReg().then(function (reg) {
                return modules.getSub().then(function (sub) {
                    if (sub) {
                        return sub;
                    } else {
                        return reg.pushManager.subscribe({userVisibleOnly: true});
                    }
                });
            });
        },

        follow: function () {
            var endpoint = '/notification/store';

            modules.updateSubscription(endpoint).then(
                function () {
                    var subscriptions = modules.getSubscriptions();
                    subscriptions.push(config.page.pageId);
                    userPrefs.set('subscriptions', uniq(subscriptions));
                    modules.configureSubscribeButton();
                }
            );
        },

        unSubscribe: function () {
            if (modules.subscriptionsEmpty()) {
                modules.getSub().then(function (sub) {
                    sub.unsubscribe().catch(function (error) {
                        robust.log('07cm-frontendNotificatons', error);
                    });
                });
            }
            modules.configureSubscribeButton();
        },

        unFollow: function () {
            var notificationsEndpoint = '/notification/delete';
            return modules.updateSubscription(notificationsEndpoint).then(
                function () {
                    var subscriptions = modules.getSubscriptions(),
                        newSubscriptions = without(subscriptions, config.page.pageId);
                    userPrefs.set('subscriptions', uniq(newSubscriptions));
                }
            );
        },

        updateSubscription: function (notificationsEndpoint) {
            return modules.getSub().then(function (sub) {
                var endpoint = sub.endpoint,
                    request = ajax({
                        url: notificationsEndpoint,
                        method: 'POST',
                        contentType: 'application/x-www-form-urlencoded',
                        data: {browserEndpoint: endpoint, notificationTopicId: config.page.pageId}
                    });
                return request;
            });
        },

        hasSubscribed: function() {
            return userPrefs.get('subscriptions');
        },

        getSubscriptions: function () {
            return modules.hasSubscribed() || [];
        },

        subscriptionsEmpty: function () {
            var subscriptions = modules.getSubscriptions();
            return subscriptions.length ? false : true;
        },

        checkSubscriptions: function () {
            var subscriptions = modules.getSubscriptions();
            return some(subscriptions, function (sub) {
                return sub == config.page.pageId;
            });
        },

        hasDismissedExplainer: function() {
           return userPrefs.get(explainerDismissed);
        }
    };

    return {
        init: modules.init
    };
});

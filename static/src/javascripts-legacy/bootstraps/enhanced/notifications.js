define([
    'bonzo',
    'qwery',
    'bean',
    'lib/fastdom-promise',
    'lib/$',
    'lib/config',
    'lib/storage',
    'lib/ajax',
    'lib/template',
    'lib/robust',
    'common/views/svgs',
    'common/modules/user-prefs',
    'common/modules/analytics/google',
    'raw-loader!common/views/ui/notifications-follow-link.html',
    'raw-loader!common/views/ui/notifications-explainer.html',
    'raw-loader!common/views/ui/notifications-permission-denied-message.html',
    'lodash/collections/some',
    'lodash/arrays/uniq',
    'lodash/arrays/without',
    'lodash/objects/isEmpty',
    'ophan/ng'
], function (
    bonzo,
    qwery,
    bean,
    fastdom,
    $,
    config,
    storage,
    ajax,
    template,
    robust,
    svgs,
    userPrefs,
    googleAnalytics,
    followLink,
    explainer,
    permissionsTemplate,
    some,
    uniq,
    without,
    isEmpty,
    ophan
) {
    var modules = {

        getReg: function () {
            return navigator.serviceWorker.ready;
        },

        getSub: function () {
            //This function can change Notification.permission
            //by asking the user if it is in 'default' state.
            return modules.getReg().then(function (reg) {return reg.pushManager.getSubscription();});
        },

        init: function() {
            modules.addButtonPromise().then(function(){
                var $followElement = modules.configureSubscribeButton();
                modules.trackFollowButtonAttention($followElement.get(0));
            });
        },

        addButtonPromise: function() {
            var button = '<button class="js-notifications__toggle notifications__toggle notifications-follow-input--solo"></button><span class="live-notifications__label js-live-notifications__label--denied live-notifications__label--hidden">Oops! You need to <a href="https://support.google.com/chrome/answer/3220216">unblock notifications</a> for www.theguardian.com</span>';
            var $container = $('.js-live-notifications');
            return fastdom.write(function(){
                $container.append(button);
            });
        },

        trackFollowButtonAttention: function (followElement) {
            if (followElement) {
                ophan.trackComponentAttention('web-notifications--follow-button', followElement);
            }
        },

        configureSubscribeButton: function () {
            var $follow = $('.js-notifications__toggle'),
                isSubscribed = modules.checkSubscriptions(),
                handler = isSubscribed ? modules.unSubscribeHandler: modules.subscribeHandler,
                src = template(followLink, {
                    isSubscribed: isSubscribed,
                    icon: svgs(isSubscribed ? 'notificationsOff' : 'notificationsOn')
                });

            if (!isEmpty($follow)) {
                fastdom.write(function () {
                    if (isSubscribed) {
                        $follow.attr('data-link-name', 'live-blog-notifications-turned-off');
                    } else {
                        $follow.attr('data-link-name', 'live-blog-notifications-turned-on');
                    }

                    $follow.html(src);
                    bean.one($follow[0], 'click', handler);
                });
            }
            return $follow;
        },

        subscribeHandler: function () {
            var wasNotGranted = Notification.permission !== 'granted';
            modules.subscribe().then(modules.follow)
                .then(function() {
                    var isNowGranted = Notification.permission === 'granted';
                    if (wasNotGranted && isNowGranted) {
                        googleAnalytics.trackNonClickInteraction('browser-notifications-granted');
                    }
                }) .catch( function () {
                    if (Notification.permission === 'denied') {
                        googleAnalytics.trackNonClickInteraction('browser-notifications-denied');
                    }
                    modules.configureSubscribeButton();
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
                }).catch(function(e) {
                    fastdom.write(function(){
                        var $denied = $('.js-live-notifications__label--denied');
                        $denied.removeClass('live-notifications__label--hidden');
                        $denied.addClass('live-notifications__label--visible');
                    });
                    throw e;
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
                var endpoint = sub && sub.endpoint;
                if (endpoint) {
                    return ajax({
                        url: notificationsEndpoint,
                        method: 'POST',
                        contentType: 'application/x-www-form-urlencoded',
                        data: {browserEndpoint: endpoint, notificationTopicId: config.page.pageId}
                    });
                }
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
        }
    };

    return {
        init: modules.init
    };
});

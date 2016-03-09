define([
    'bonzo',
    'qwery',
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/ajax',
    'common/utils/template',
    'common/utils/mediator',
    'common/utils/robust',
    'common/views/svgs',
    'common/modules/user-prefs',
    'text!common/views/ui/notifications-subscribe-link.html',
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
    template,
    mediator,
    robust,
    svgs,
    userPrefs,
    subscribeTemplate,
    some,
    uniq,
    without
) {
    var modules, reg, sub,
        isSubscribed = false,
        subscribeButton;

    modules = {

        getPushSubscription: function () {

            console.log("++ Strapped 2");
            navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                reg = serviceWorkerRegistration;
                serviceWorkerRegistration.pushManager.getSubscription().then(function (pushSubscription) {

                    if (pushSubscription) {
                        sub = pushSubscription;
                        modules.configureSubscribeTemplate();
                    } else {
                        reg.pushManager.subscribe({userVisibleOnly: true}).then(
                            function (pushSubscription) {
                                sub = pushSubscription;
                                modules.configureSubscribeTemplate();
                            }
                        );
                    }
                });
            });
        },

        configureSubscribeTemplate: function () {
            var subscribed = modules.checkSubscriptions(),
                hasNoSubscriptions = modules.subscriptionsEmpty(),
                src = template(subscribeTemplate, {
                    className: hasNoSubscriptions ? '' : 'notifications-subscribe-link--has-subscriptions',
                    text: subscribed ? 'Following story' : 'Follow story',
                    imgMobile: svgs('notificationsExplainerMobile', ['mobile-only', 'notification-explainer']),
                    imgDesktop: svgs('notificationsExplainerDesktop', ['hide-on-mobile', 'notification-explainer'])
                });

            fastdom.write(function () {
                $('.js-liveblog-body').prepend(src);
                mediator.emit('page:notifications:ready');
            });

            bean.on(document.body, 'click', '.js-notifications-subscribe-link', function () {
                modules.buttonHandler();
            });
        },

        setSubscriptionStatus: function (subscribed) {
            var subscribeButton = $('.js-notifications-subscribe-link'),
                subscribeLink = $('.notifications-subscribe-link--follow');
            isSubscribed = subscribed;
            if (subscribed) {
                subscribeLink.addClass('notifications-subscribe-link--has-subscriptions');
            }
            subscribeButton[0].textContent = subscribed ?  'Following story' : 'Follow story';
        },

        buttonHandler: function () {
            if (isSubscribed) {
                modules.stopFollowingThis();
            } else {
                modules.subscribe();
            }
        },

        subscribe: function () {
            if (modules.subscriptionsEmpty()) {
                reg.pushManager.subscribe({userVisibleOnly: true}).then(function (pushSubscription) {
                    sub = pushSubscription;
                    modules.followThis();
                });
            } else {
                modules.followThis();
            }
        },


        unSubscribe: function () {
            if (modules.subscriptionsEmpty()) {
                sub.unsubscribe().then(function () {
                }).catch(function (error) {
                    robust.log('07cm-frontendNotificatons', error);
                });
            }
        },

        subscriptionsEmpty: function () {
            var subscriptions = userPrefs.get('subscriptions') || [];
            return subscriptions.length ? false : true;
        },

        checkSubscriptions: function () {
            var subscriptions = userPrefs.get('subscriptions') || [];
            return some(subscriptions, function (sub) {
                return sub == config.page.pageId;
            });
        },

        followThis: function () {
            var endpoint = '/notification/store';

            modules.updateSubscription(endpoint).then(
                function () {
                    var subscriptions = userPrefs.get('subscriptions') || [];
                    subscriptions.push(config.page.pageId);
                    userPrefs.set('subscriptions', uniq(subscriptions));
                    modules.setSubscriptionStatus(true);
                }
            );
        },

        stopFollowingThis: function () {

            var endpoint = '/notification/delete';
            modules.updateSubscription(endpoint).then(
                function () {
                    var subscriptions = userPrefs.get('subscriptions') || [],
                        newSubscriptions = without(subscriptions, config.page.pageId);
                    userPrefs.set('subscriptions', uniq(newSubscriptions));
                    modules.setSubscriptionStatus(false);
                    if (modules.subscriptionsEmpty()) {
                        modules.unSubscribe();
                    }
                }
            );
        },

        updateSubscription: function (endpoint) {

            var gcmBrowserId = sub.endpoint.substring(sub.endpoint.lastIndexOf('/') + 1),
                request =  ajax({
                url: endpoint,
                method: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                data: {gcmBrowserId: gcmBrowserId, notificationTopicId: config.page.pageId }
            });
            return request;
        }
    };

    return {
        init: modules.getPushSubscription()
    };
});

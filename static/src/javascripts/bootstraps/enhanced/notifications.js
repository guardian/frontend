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

        configureButton: function () {
            subscribeButton.removeClass('js-hide-follow-button');
            subscribeButton[0].disabled = false;
            bean.on(subscribeButton[0], 'click', modules.buttonHandler);
            if (modules.checkSubscriptions()) {
                modules.setSubscriptionStatus(true);
            }
        },

        configureSubscribeTemplate: function () {
            var subscribed = modules.checkSubscriptions(),
                src = template(subscribeTemplate, {
                    className: subscribed ? 'notifications-subscribe-link--following' : '',
                    text: subscribed ? 'Following story' : 'Follow story',
                    imgMobile: svgs('notificationsExplainerMobile', ['mobile-only', 'notification-explainer']),
                    imgDesktop: svgs('notificationsExplainerDesktop', ['hide-on-mobile', 'notification-explainer'])
                });

            fastdom.write(function () {
                $('.js-liveblog-body').prepend(src);
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
                subscribeLink.addClass('notifications-subscribe-link--following');
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
                });
            }
            modules.followThis();
        },


        unSubscribe: function () {
            if (modules.subscriptionsEmpty()) {
                sub.unsubscribe().then(function (event) {
                }).catch(function (error) {
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
                function (rsp) {
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

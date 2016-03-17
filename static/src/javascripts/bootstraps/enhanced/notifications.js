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
    var modules, isSubscribed = false;

    modules = {

        getReg: function () {
            console.log("++  Reg");
            return navigator.serviceWorker.ready;
        },

        getSub: function () {
            return modules.getReg().then(function (reg) {
                console.log("++ Sub");
                return reg.pushManager.getSubscription();
            });
        },


        getPushSubscription: function () {
           modules.getReg().then(
               function(){
                   console.log("Got Reg");
                   modules.configureSubscribeTemplate();
               }
           );
        },

        xcxxxgetPushSubscription: function () {

            console.log("+++++++++++++++ WOTCHA!");
            modules.getSub().then(function (pushSubscription) {
                console.log("+++++++++++++++ WOTCHA!  = Sub");
                if (pushSubscription) {
                    console.log("+++++++++++++++ Sub");
                    modules.configureSubscribeTemplate();
                } else {
                    console.log("+++++++++++++++ No Sub");
                    modules.subscribe();
                }
            });
        },

        /*
        getPushSubscriptionOld: function () {

            navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                reg = serviceWorkerRegistration;
                serviceWorkerRegistration.pushManager.getSubscription().then(function (pushSubscription) {

                    if (pushSubscription) {
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
        }*/


        configureSubscribeTemplate: function () {
            console.log("++ CONF");
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
            subscribeButton[0].textContent = subscribed ?  'Unfollow' : 'Follow story';
        },

        buttonHandler: function () {
            if (isSubscribed) {
                modules.unFollow().then(modules.unSubscribe);
            } else {
                modules.subscribe().then(modules.follow);
            }
        },

        subscribe: function () {
            console.log("++++ Gettin la Sub");
            return modules.getReg().then(function(reg) {
                return modules.getSub().then(function (sub) {
                    if (sub) {
                        console.log("++ Old Sub: " + JSON.stringify(sub));
                        return sub;
                    } else {
                        console.log("++ Reg");
                        return reg.pushManager.subscribe({userVisibleOnly: true});
                    }
                });
            });
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

        follow: function () {
            var endpoint = '/notification/store';

            modules.updateSubscription(endpoint).then(
                function () {
                    var subscriptions = modules.getSubscriptions();
                    subscriptions.push(config.page.pageId);
                    userPrefs.set('subscriptions', uniq(subscriptions));
                    modules.setSubscriptionStatus(true);
                }
            );
        },

        unFollow: function () {
            var notificationsEndpoint = '/notification/delete';
            modules.updateSubscription(notificationsEndpoint).then(
                function () {
                    var subscriptions = modules.getSubscriptions(),
                        newSubscriptions = without(subscriptions, config.page.pageId);
                    userPrefs.set('subscriptions', uniq(newSubscriptions));
                    modules.setSubscriptionStatus(false);
                }
            );
        },

        unSubscribe: function () {
            if (modules.subscriptionsEmpty()) {
                modules.getSub().then(function(sub){
                    sub.unsubscribe().catch(function (error) {
                        robust.log('07cm-frontendNotificatons', error);
                    });
                });
            }
        },

        updateSubscription: function (notificationsEndpoint) {

            return modules.getSub().then(function(sub) {
                var endpoint = sub.endpoint;
                console.log("++ Endpoint! " + endpoint.substring(endpoint.lastIndexOf('/') + 1));

                var gcmBrowserId = endpoint.substring(endpoint.lastIndexOf('/') + 1),
                    request = ajax({
                        url: notificationsEndpoint,
                        method: 'POST',
                        contentType: 'application/x-www-form-urlencoded',
                        data: {gcmBrowserId: gcmBrowserId, notificationTopicId: config.page.pageId}
                    });
                return request;
            });
        },

        getSubscriptions: function () {
            return userPrefs.get('subscriptions') || [];
        }
    };

    return {
        init: modules.getPushSubscription()
    };
});

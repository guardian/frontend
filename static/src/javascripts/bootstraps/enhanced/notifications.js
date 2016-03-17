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
    var modules;

    modules = {

        getReg: function () {
            return navigator.serviceWorker.ready;
        },

        getSub: function () {
            return modules.getReg().then(function (reg) {return reg.pushManager.getSubscription();});
        },


        getPushSubscription: function () {
           modules.getReg().then(
               function(){
                   console.log("Got Reg");
                   modules.configureSubscribeTemplate();
               }
           );
        },

        configureSubscribeTemplate: function () {
            var subscribed = modules.checkSubscriptions(),
                hasNoSubscriptions = modules.subscriptionsEmpty(),
                handler = subscribed ? modules.unSubscribeHandler : modules.subscribeHandler,
                src = template(subscribeTemplate, {
                    className: hasNoSubscriptions ? '' : 'notifications-subscribe-link--has-subscriptions',
                    text: subscribed ? 'Unfollow' : 'Follow story',
                    imgMobile: svgs('notificationsExplainerMobile', ['mobile-only', 'notification-explainer']),
                    imgDesktop: svgs('notificationsExplainerDesktop', ['hide-on-mobile', 'notification-explainer'])
                });

            fastdom.write(function () {
                $('.js-liveblog-body').prepend(src);
                mediator.emit('page:notifications:ready');
            });

            bean.one(document.body, 'click', '.js-notifications-subscribe-link', handler);
        },

        setSubscriptionStatus: function (subscribed) {
            var subscribeButton = $('.js-notifications-subscribe-link'),
                subscribeLink = $('.notifications-subscribe-link--follow'),
                handler = subscribed ? modules.unSubscribeHandler : modules.subscribeHandler;
            if (subscribed) {
                subscribeLink.addClass('notifications-subscribe-link--has-subscriptions');
            }
            subscribeButton[0].textContent = subscribed ?  'Unfollow' : 'Follow story';
            bean.one(document.body, 'click', '.js-notifications-subscribe-link', handler);
        },

        subscribeHandler: function() {
            modules.subscribe().then(modules.follow());
        },

        unSubscribeHandler: function() {
            modules.unFollow().then(modules.unSubscribe);
        },

        subscribe: function () {
            return modules.getReg().then(function(reg) {
                return modules.getSub().then(function (sub) {
                    if (sub) {
                        return sub;
                    } else {
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
            console.log("++ Unfollow");
            var notificationsEndpoint = '/notification/delete';
            return modules.updateSubscription(notificationsEndpoint).then(
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
        init: modules.configureSubscribeTemplate()
    };
});

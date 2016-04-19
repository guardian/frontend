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
    'common/utils/robust',
    'common/views/svgs',
    'common/modules/user-prefs',
    'text!common/views/ui/notifications-follow-link.html',
    'text!common/views/ui/notifications-explainer.html',
    'text!common/views/ui/notifications-permission-denied-message.html',
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
    var modules = {

        getReg: function () {
            return navigator.serviceWorker.ready;
        },

        getSub: function () {
            return modules.getReg().then(function (reg) {return reg.pushManager.getSubscription();});
        },

/*
        checkPermissions: function() {
            console.log("++++ Handle permission");
            return modules.getReg().then(function(reg){
                console.log("Got Reg");
                return modules.getSub().then(function(sub){
                    console.log("Got Sub");
                    if(sub) {
                        console.log("+++++++++++++++ Have sub");
                        modules.configureSubscribeTemplate();
                    } else {
                        console.log("Have not a sub");
                        reg.pushManager.subscribe({userVisibleOnly: true}).then(function(sub) {
                            modules.configureSubscribeTemplate();
                        });
                    }
                })

            });
        },


*/
        configureSubscribeTemplate: function() {
            var $follows = bonzo(qwery('.js-notification-link')),
                subscribed = modules.checkSubscriptions(),
                hasNoSubscriptions = modules.subscriptionsEmpty(),
                handler = subscribed ? modules.unSubscribeHandler : modules.subscribeHandler,
                src = template(followLink, {
                    subscribed: subscribed,
                    icon: svgs(subscribed ? 'notificationsOff' : 'notificationsOn')
                });

            console.log("Follow");

            $follows.each(function(follow) {
                console.log("++ Follow");
                var $follow = bonzo(follow);
                $follow.html(src);
                bean.one($follow[0], 'click', '.js-notifications__button', handler );
            });

            modules.showExplainer();

        },

        showExplainer: function() {
            console.log("Show explainter");
            var src = template(explainer,{
                closeIcon : svgs('closeCentralIcon'),
                imgMobile: svgs('mobileNotificationsExplainer', ['mobile-only', 'notification-explainer']),
                imgDesktop: svgs('desktopNotificationsExplainer', ['hide-on-mobile', 'notification-explainer'])
            });
            fastdom.write(function () {
                console.log("++ Write: " + src );
                var notificationLink = $('.js-notification-link');
                notificationLink.append(src);
                console.log("++ Written it!");
                //bean.one(document.body, 'click', '.js-notifications-subscribe-link', modules.subscribeHandler );
                //bean.one(document.body, 'click', '.js-notifications__item__close', modules.closeDisplayMessage);
                console.log("++ Handled");
                bean.on(notificationLink[0], 'click', '.js-notifications__item__close', function(){
                    console.log("Close-notifice !");
                    fastdom.write(function() {
                        console.log("++ Remove explainer");
                        $('.js-notifications-explainer').remove();
                    });
                })
            });
        },



        xxxxxconfigureSubscribeTemplate: function () {
            console.log("++ Template");
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
                $('.js-notifications').prepend(src);
                bean.one(document.body, 'click', '.js-notifications-subscribe-link', handler);
            });
            //modules.displayPermissiosMessage();
        },

        closeDisplayMessage: function(){
            console.log("++ Close permission notification");
            $('.js-notifications-permission-denied').remove();
            bean.one(document.body, 'click', '.js-notifications-subscribe-link', modules.subscribeHandler);
        },

        displayPermissiosMessage: function() {
            console.log("++ CLick");
            var src = template(permissionsTemplate,{closeIcon : svgs('closeCentralIcon')});
            fastdom.write(function () {
                console.log("++ Write: " + src );
                $('.js-notifications').prepend(src);
                console.log("++ Written it");
                //bean.one(document.body, 'click', '.js-notifications-subscribe-link', modules.subscribeHandler );
                bean.one(document.body, 'click', '.js-notifications__item__close', modules.closeDisplayMessage);
                console.log("++ Handled");
            });
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

        //TODO ffs dont commit this
        subscribeHandler: function () {
            modules.subscribe().then(modules.follow)
                .catch( function(err){
                    if (Notification.permission === 'denied') {
                        console.log("+++ Gotcha Now!");
                        modules.displayPermissiosMessage();
                    }
                });
        },

        unSubscribeHandler: function () {
            modules.unFollow().then(modules.unSubscribe);
        },

        subscribe: function () {
            console.log("+ Subscribe");

            return modules.getReg().then(function (reg) {
                if(reg) {
                    console.log("+ Reggie Reggie");
                } else {
                    console.log("+ No Reggie");
                }
                return modules.getSub().then(function (sub) {
                    if (sub) {
                        return sub;
                    } else {
                        return reg.pushManager.subscribe({userVisibleOnly: true});
                    }
                })
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

        unSubscribe: function () {
            if (modules.subscriptionsEmpty()) {
                modules.getSub().then(function (sub) {
                    sub.unsubscribe().catch(function (error) {
                        robust.log('07cm-frontendNotificatons', error);
                    });
                });
            }
        },

        unFollow: function () {
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

        getSubscriptions: function () {
            return userPrefs.get('subscriptions') || [];
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
        init: modules.configureSubscribeTemplate
    };
});

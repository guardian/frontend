define([
    'bean',
    'fastdom',
    'qwery',
    'bonzo',
    'common/utils/template',
    'common/utils/$',
    'common/views/svgs',
    'text!common/views/ui/notifications-follow-link.html',
    'text!common/views/ui/notifications-explainer.html',
    'text!common/views/ui/notifications-permission-denied-message.html'
], function (
    bean,
    fastdom,
    qwery,
    bonzo,
    template,
    $,
    svgs,
    followLink,
    explainer,
    permissionsTemplate
) {
    var subscribed = false,
        modules = {

        cxxxonfigureSubscribeTemplate: function () {
            var handler = subscribed ? modules.unSubscribeHandler : modules.subscribeHandler,
                src = template(followLink, {
                    icon: svgs('notificationsOff'),
                });
            fastdom.write(function(){
                $('.js-notification-link').append(src);
            });
        },

        init: function() {
            var $follows = bonzo(qwery('.js-notification-link')),
                handler = subscribed ? modules.unSubscribeHandler : modules.subscribeHandler, //There's only one, baby,
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

        subscribeHandler: function() {
            console.log("++ SubscribeHandler");
            subscribed = true;
            modules.init();
        },

        unSubscribeHandler: function() {
            console.log("++ UnSubscribeHandler");
            subscribed = false;
            modules.init();
        }
    };




    return {
        init: modules.init
    };
});

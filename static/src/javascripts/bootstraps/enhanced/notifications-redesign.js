define([
    'bean',
    'fastdom',
    'qwery',
    'bonzo',
    'common/utils/template',
    'common/utils/$',
    'common/views/svgs',
    'text!common/views/ui/notifications-follow-link.html',
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

        configureSubscribeTemplate: function() {
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
            })





        },

        subscribeHandler: function() {
            console.log("++ SubscribeHandler");
            subscribed = true;
            modules.configureSubscribeTemplate();
        },

        unSubscribeHandler: function() {
            console.log("++ UnSubscribeHandler");
            subscribed = false;
            modules.configureSubscribeTemplate();
        }
    };




    return {
        init: modules.configureSubscribeTemplate
    };
});

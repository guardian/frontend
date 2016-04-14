define([
    'bean',
    'fastdom',
    'common/utils/template',
    'common/utils/$',
    'common/views/svgs',
    'text!common/views/ui/notifications-follow-link.html',
    'text!common/views/ui/notifications-permission-denied-message.html'
], function (
    bean,
    fastdom,
    template,
    $,
    svgs,
    followLink,
    permissionsTemplate
) {
    var subscribed = false,
        modules = {

        configureSubscribeTemplate: function () {
            var handler = subscribed ? modules.unSubscribeHandler : modules.subscribeHandler
                src = template(followLink, {
                icon: svgs('notificationsOff'),
            });
            fastdom.write(function(){
                $('.js-notification-link').append(src);
            });
        },

        subscribeHandler: function() {
            console.log("++ SubscribeHandler");
        },

        unSubscribeHandler: function() {
            console.log("++ UnSubscribeHandler");
        }
    };




    return {
        init: modules.configureSubscribeTemplate
    };
});

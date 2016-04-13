define([
    'bean',
    'fastdom',
    'common/utils/template',
    'text!common/views/ui/notifications-subscribe-link.html',
    'text!common/views/ui/notifications-permission-denied-message.html'
], function (
    bean,
    fastdom,
    template,
    subscribeTemplate,
    permissionsTemplate
) {
    var modules = {

        configureSubscribeTemplate: function () {
            console.log("++ Template");
/*
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
*/
            //modules.displayPermissiosMessage();
        }
    };

    return {
        init: modules.configureSubscribeTemplate
    };
});

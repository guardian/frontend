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
    var modules = {

        configureSubscribeTemplate: function () {
            var src = template(followLink, {
                icon: svgs('notificationsOff'),
                text: 'Get alerts on this story'
            });
            fastdom.write(function(){
                $('.js-live-blog__key-events').append(src);
            });

        }
    };

    return {
        init: modules.configureSubscribeTemplate
    };
});

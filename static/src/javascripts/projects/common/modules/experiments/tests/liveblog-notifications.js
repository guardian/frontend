define([
    'common/utils/config',
    'common/utils/$',
    'common/utils/template',
    'fastdom',
    'text!common/views/ui/notifications-subcribe-link.html',
    'common/utils/cookies',
    'bean',
    'common/views/svgs'
], function (
    config,
    $,
    template,
    fastdom,
    subscribeTemplate,
    cookies,
    bean,
    svgs
) {

    return function () {
        this.id = 'LiveblogNotifications';
        this.start = '2015-05-27';
        this.expiry = '2015-08-01';
        this.author = 'Oliver Ash';
        this.description = 'Liveblog notifications';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'a',
                test: function () {
                    var enabled = cookies.get('notifications-demo-following'),
                        src = template(subscribeTemplate, {
                            className: enabled ? '' : 'notifications--disabled',
                            url: window.location,
                            text: enabled ? 'Following story' : 'Follow story',
                            imgMobile: svgs('notificationsExplainerMobile', ['mobile-only', 'notification-explainer']),
                            imgDesktop: svgs('notificationsExplainerDesktop', ['hide-on-mobile', 'notification-explainer']),
                            arrow: svgs('arrowWhiteRight')
                        });
                    fastdom.write(function () {
                        $('.js-liveblog-body').prepend(src);
                    });
                    bean.on(document.body, 'click', '.js-notifications-subscribe-link', function () {
                        cookies.add('notifications-demo-following', 'true', 100);
                    });
                }
            }
        ];
    };

});

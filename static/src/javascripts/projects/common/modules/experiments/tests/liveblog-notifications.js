define([
    'common/utils/config',
    'common/utils/$',
    'common/utils/template',
    'fastdom',
    'text!common/views/ui/notifications-subcribe-link.html',
    'common/utils/cookies',
    'bean'
], function (
    config,
    $,
    template,
    fastdom,
    subscribeTemplate,
    cookies,
    bean
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
                    fastdom.write(function () {
                        $('.js-liveblog-body').prepend(template(subscribeTemplate, {
                            url: window.location,
                            text: cookies.get(window.location + '-notification') ? 'Following story' : 'Follow story'
                        }));
                    });
                    bean.on(document.body, 'click', '.js-notifications-subscribe-link', function () {
                        cookies.add(window.location + '-notification', 'true', 100);
                    });
                }
            }
        ];
    };

});

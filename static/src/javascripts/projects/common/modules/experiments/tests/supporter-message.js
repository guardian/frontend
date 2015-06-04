define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/ui/message',
    'common/modules/identity/api',
    'text!common/views/supporter-message.html'
], function (
    config,
    detect,
    template,
    Message,
    idApi,
    supporterMessageTmpl
) {

    return function () {

        this.id = 'Supporter';
        this.start = '2015-06-03';
        this.expiry = '2015-06-08';
        this.author = 'David Rapson';
        this.description = 'Test if logged in users are encouraged to become a Supporter';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.successMeasure = 'Users will be interested in Supporter tier';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'supporter message, hide, read more';
        this.idealOutcome = 'Users will sign up as a Supporter';

        this.canRun = function () {
            return config.page.contentType === 'Article' && detect.getBreakpoint() !== 'mobile' && idApi.isUserLoggedIn();
        };

        this.variants = [{
            id: 'A',
            test: function () {
                new Message('supporter', {
                    pinOnHide: false,
                    siteMessageLinkName: 'supporter message',
                    siteMessageCloseBtn: 'hide'
                }).show(template(supporterMessageTmpl, {
                    supporterLink: 'https://membership.theguardian.com/about/supporter',
                    messageText: 'Not already a member? Start supporting us today',
                    linkText: 'Become a supporter'
                }));
            }
        },
        {
            id: 'B',
            test: function () {
                new Message('supporter', {
                    pinOnHide: false,
                    siteMessageLinkName: 'supporter message',
                    siteMessageCloseBtn: 'hide'
                }).show(template(supporterMessageTmpl, {
                    supporterLink: 'https://membership.theguardian.com/about/supporter',
                    messageText: 'Become a Guardian Member and support fearless investigative journalism',
                    linkText: 'Become a supporter'
                }));
            }
        }];

    };

});

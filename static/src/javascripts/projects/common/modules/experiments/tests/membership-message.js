define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/ui/message',
    'common/modules/identity/api',
    'common/views/memebership-message.html!text'
], function (
    config,
    detect,
    template,
    Message,
    idApi,
    messageTmpl
) {

    return function () {

        this.id = 'MembershipMessage';
        this.start = '2015-06-08';
        this.expiry = '2015-06-19';
        this.author = 'David Rapson';
        this.description = 'Test if logged in users are encouraged to join Membership';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Users will be interested in Membership';
        this.audienceCriteria = '100% of logged in users, only on article pages';
        this.dataLinkNames = 'supporter message, hide, read more';
        this.idealOutcome = 'Users will sign up as a Guardian Member';

        this.canRun = function () {
            return idApi.isUserLoggedIn() && config.page.contentType === 'Article';
        };

        this.variants = [{
            id: 'A',
            test: function () {
                new Message('membership-message', {
                    pinOnHide: false,
                    siteMessageLinkName: 'membership message',
                    siteMessageCloseBtn: 'hide'
                }).show(template(messageTmpl, {
                    supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=MEMBERSHIP_BANNER_TEST_A',
                    messageText: 'Become a Guardian Member and support fearless investigative journalism',
                    linkText: 'Become a supporter'
                }));
            }
        },
        {
            id: 'B',
            test: function () {
                new Message('membership-message', {
                    pinOnHide: false,
                    siteMessageLinkName: 'membership message',
                    siteMessageCloseBtn: 'hide'
                }).show(template(messageTmpl, {
                    supporterLink: 'https://membership.theguardian.com/about?INTCMP=MEMBERSHIP_BANNER_TEST_B',
                    messageText: 'Become a Guardian Member and support fearless investigative journalism',
                    linkText: 'Become a partner'
                }));
            }
        }];

    };

});

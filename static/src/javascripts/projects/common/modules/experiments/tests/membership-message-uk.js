define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/identity/api',
    'common/modules/ui/message',
    'text!common/views/membership-message.html',
    'common/views/svgs'
], function (
    config,
    detect,
    storage,
    template,
    idApi,
    Message,
    messageTemplate,
    svgs
) {

    var messageId = 'membership-message-uk';

    return function () {

        this.id = 'MembershipMessageUk';
        this.start = '2015-08-16';
        this.expiry = '2015-11-18';
        this.author = 'David Rapson';
        this.description = 'Test if loyal visitors in the UK edition are encouraged to join Membership as a Supporter';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Loyal visitors will be interested in becoming a Supporter';
        this.audienceCriteria = 'UK edition visitors who have seen more than 10 pages, message shown only on article pages';
        this.dataLinkNames = 'membership message, hide, read more';
        this.idealOutcome = 'Users will sign up as a Supporter';

        this.canRun = function () {
            /**
             * - Exclude adblock users to avoid conflicts with similar adblock Supporter message
             * - Exclude mobile/small-screen devices
             * - Only show for UK edition
             * - Only show on Article pages
             * - Only show to visitors who have viewed more than 10 pages.
             */
            var alreadyVisited = storage.local.get('alreadyVisited') || 0;
            return !detect.adblockInUse &&
                detect.getBreakpoint() !== 'mobile' &&
                config.page.edition === 'UK' &&
                config.page.contentType === 'Article' &&
                alreadyVisited > 10;
        };

        this.variants = [{
            id: 'A',
            test: function () {
                new Message(messageId, {
                    pinOnHide: false,
                    siteMessageLinkName: 'membership message',
                    siteMessageCloseBtn: 'hide'
                }).show(template(messageTemplate, {
                    supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=MEMBERSHIP_SUPPORTER_BANNER_UK_A',
                    messageText: '“Become a Guardian Member and support independent journalism” – George Monbiot',
                    linkText: 'Find out more',
                    arrowWhiteRight: svgs('arrowWhiteRight')
                }));
            }
        },
        {
            id: 'B',
            test: function () {
                new Message(messageId, {
                    pinOnHide: false,
                    siteMessageLinkName: 'membership message',
                    siteMessageCloseBtn: 'hide'
                }).show(template(messageTemplate, {
                    supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=MEMBERSHIP_SUPPORTER_BANNER_UK_B',
                    messageText: '“Support and become part of the Guardian” – Hugh Muir',
                    linkText: 'Find out more',
                    arrowWhiteRight: svgs('arrowWhiteRight')
                }));
            }
        }];

    };

});

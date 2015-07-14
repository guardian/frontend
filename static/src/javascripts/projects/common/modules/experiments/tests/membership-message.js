define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/identity/api',
    'common/modules/ui/message',
    'text!common/views/membership-message.html'
], function (
    config,
    detect,
    storage,
    template,
    idApi,
    Message,
    messageTemplate
) {

    return function () {

        this.id = 'MembershipMessageVariants';
        this.start = '2015-07-13';
        this.expiry = '2015-08-20';
        this.author = 'David Rapson';
        this.description = 'Test if loyal users are encouraged to join Membership as a Supporter';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Loyal users will be interested in becoming a Supporter';
        this.audienceCriteria = 'Users who have seen 10 or more pages, message shown only on article pages';
        this.dataLinkNames = 'supporter message, hide, read more';
        this.idealOutcome = 'Users will sign up as a Supporter';

        this.canRun = function () {
            /**
             * Exclude adblock users to avoid conflicts with similar adblock Supporter message,
             * only show to users who have viewed 10 or more pages.
             */
            var alreadyVisited = storage.local.get('alreadyVisited') || 0;
            return !detect.adblockInUse &&
                config.page.edition === 'UK' &&
                config.page.contentType === 'Article' &&
                alreadyVisited > 9;
        };

        this.variants = [{
            id: 'A',
            test: function () {
                new Message('membership-message-variants', {
                    pinOnHide: false,
                    siteMessageLinkName: 'membership message',
                    siteMessageCloseBtn: 'hide'
                }).show(template(messageTemplate, {
                    supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=MEMBERSHIP_SUBSCRIBER_LOYALTY_BANNER_A',
                    messageText: 'Become a Guardian Member and support fearless investigative journalism',
                    linkText: 'Become a supporter'
                }));
            }
        },
        {
            id: 'B',
            test: function () {
                new Message('membership-message-variants', {
                    pinOnHide: false,
                    siteMessageLinkName: 'membership message',
                    siteMessageCloseBtn: 'hide'
                }).show(template(messageTemplate, {
                    supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=MEMBERSHIP_SUBSCRIBER_LOYALTY_BANNER_B',
                    messageText: '"If you read the Guardian, join the Guardian" Polly Toynbee.',
                    linkText: 'Find out more'
                }));
            }
        }];

    };

});

define([
    'common/utils/detect',
    'common/utils/template',
    'common/modules/ui/message',
    'text!common/views/donot-use-adblock.html'
], function (
    detect,
    template,
    Message,
    doNotUseAdblockTemplate
) {
    return function () {
        this.id = 'AdBlock';
        this.start = '2015-05-14';
        this.expiry = '2015-05-28';
        this.author = 'Zofia Korcz';
        this.description = 'Test if the users will disable adblock or at least click support link';
        this.audience = 0.5;
        this.audienceOffset = 0;
        this.successMeasure = 'Users will disable adblock or at least click support link';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'adblock message, hide, read more';
        this.idealOutcome = 'Users will disable adblock on theguardian site';

        this.canRun = function () {
            console.log(detect.adblockInUse);
            return detect.getBreakpoint() !== 'mobile' && detect.adblockInUse;
        };

        this.variants = [
            {
                id: 'Variant',
                test: function () {
                    var adblockLink = 'https://membership.theguardian.com/about/supporter?INTCMP=adb-mv';

                    new Message('adblock', {
                        pinOnHide: false,
                        siteMessageLinkName: 'adblock message Variant',
                        siteMessageCloseBtn: 'hide'
                    }).show(template(
                            doNotUseAdblockTemplate,
                            {
                                adblockLink: adblockLink,
                                messageText: 'We notice you\'ve got an ad-blocker switched on. Perhaps you\'d like to support the Guardian another way?',
                                linkText: 'Become a supporter today'
                            }
                        ));
                }
            },
            {
                id: 'Control',
                test: function () {}
            }
        ];
    };

});

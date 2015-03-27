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
        this.id = 'AdBlockMessage';
        this.start = '2015-03-27';
        this.expiry = '2015-04-27';
        this.author = 'Zofia Korcz';
        this.description = 'Test if the users will disable adblock on our site';
        this.audience = 0.1;
        this.audienceOffset = 0;
        this.successMeasure = 'Users will disable adblock on theguardian site';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'adblock message, hide, read more';
        this.idealOutcome = 'Users will disable adblock on theguardian site';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    var adblockLink = 'https://membership.theguardian.com/about/supporter',
                        adblockMessage;

                    if (detect.getBreakpoint() !== 'mobile' && detect.adblockInUse()) {
                        new Message('adblock', {
                            pinOnHide: false,
                            siteMessageLinkName: 'adblock message',
                            siteMessageCloseBtn: 'hide'
                        }).show(template(
                            doNotUseAdblockTemplate,
                            {
                                adblockLink: adblockLink
                            }
                        ));
                    }
                }
            }
        ];
    };

});

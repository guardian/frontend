define([
    'common/utils/detect',
    'common/utils/storage',

    'common/modules/analytics/omniture',
    'common/modules/ui/message',

    'text!common/views/donot-use-adblock.html'
], function (
    detect,
    storage,

    omniture,
    message,

    doNotUseAdblockTemplate
) {
    return function () {
        this.id = 'AdBlockMessage';
        this.start = '2014-12-23'; //TODO
        this.expiry = '2015-02-01'; //TODO
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
                id: 'control',
                test: function () { }
            },
            {
                id: 'show',
                test: function () {
                    console.log('show');
                }
                  /*  var adblockLink = 'https://www.theguardian.com/',//TODO, also text in template
                        adblockMessage,
                        localStorage = storage.local;

                    if (detect.getBreakpoint() !== 'mobile') {
                        if (detect.adblockInUse()) {
                            s.prop40 = 'adblocktrue';
                            localStorage.set('adblockInUse', true);
                            adblockMessage = new Message('adblock', {
                                pinOnHide: false,
                                siteMessageLinkName: 'adblock message',
                                siteMessageCloseBtn: 'hide'
                            });
                            adblockMessage.show(template(
                                doNotUseAdblockTemplate,
                                {
                                    adblockLink: adblockLink
                                }
                            ));
                        } else {
                            //if we detected adblock before, we can assume that the user disabled it for us
                            if (localStorage.get('adblockInUse')) {
                                s.prop40 = 'adblockdisabled';
                            } else {
                                s.prop40 = 'adblockfalse';
                            }
                        }
                    }
                } */
            }
        ];
    };

});

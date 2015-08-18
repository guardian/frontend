define([
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/views/svgs',
    'common/modules/adblock-banner'
], function (
    _,
    config,
    detect,
    template,
    svgs,
    AdblockBanner
) {

    var variations = [{
            supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=ADBLOCK_BANNER_MONBIOT',
            quoteText: 'Become a Guardian Member and support independent journalism',
            quoteAuthor: 'George Monbiot',
            imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/contributor/2015/7/9/1436429159376/George-Monbiot-L.png?w=300&amp;q=85&amp;auto=format&amp;sharp=10&amp;s=903233b032379d7529d7337b8c26bcc9'
        },
        {
            supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=ADBLOCK_BANNER_MUIR',
            quoteText: 'Support and become part of the Guardian',
            quoteAuthor: 'Hugh Muir',
            imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/pictures/2014/3/13/1394733739000/HughMuir.png?w=300&amp;q=85&amp;auto=format&amp;sharp=10&amp;s=c1eeb35230ad2a215ec9de76b3eb69fb'
        },
        {
            supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=ADBLOCK_BANNER_TOYNBEE',
            quoteText: 'If you read the Guardian, join the Guardian',
            quoteAuthor: 'Polly Toynbee',
            imageAuthor: '//i.guim.co.uk/img/static/sys-images/Guardian/Pix/contributor/2014/6/30/1404146756739/Polly-Toynbee-L.png?w=300&amp;q=85&amp;auto=format&amp;sharp=10&amp;s=abf0ce1a1a7935e82612b330322f5fa4'
        }];

    return function () {

        this.id = 'AdblockStickyBanner';
        this.start = '2015-08-11';
        this.expiry = '2015-08-28';
        this.author = 'Zofia Korcz';
        this.description = 'Test if ad-block users are encouraged to support us by joining membership';
        this.audience = 0.15;
        this.audienceOffset = 0.25;
        this.successMeasure = 'Ad-block users will be interested in becoming a Supporter';
        this.audienceCriteria = 'Users who have ad-block installed and are not on mobile';
        this.dataLinkNames = 'supporter message, read more';
        this.idealOutcome = 'Users will sign up as a Supporter or will turn off the ad-block';

        this.canRun = function () {
            /**
             * Adblock users who are not on mobile.
             */
            return detect.getBreakpoint() !== 'mobile' && detect.adblockInUse;
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    new AdblockBanner(variations[_.random(variations.length - 1)]).show();
                }
            },
            {
                id: 'challenger',
                test: function () {
                    variations[0].supporterLink = 'https://membership.theguardian.com?INTCMP=ADBLOCK_BANNER_MONBIOT';
                    variations[1].supporterLink = 'https://membership.theguardian.com?INTCMP=ADBLOCK_BANNER_MUIR';
                    variations[2].supporterLink = 'https://membership.theguardian.com?INTCMP=ADBLOCK_BANNER_TOYNBEE';
                    new AdblockBanner(variations[_.random(variations.length - 1)]).show();
                }
            },
            {
                id: 'control',
                test: function () {}
            }
        ];
    };
});

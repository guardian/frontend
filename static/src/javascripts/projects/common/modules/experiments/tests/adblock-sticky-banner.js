define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/views/svgs',
    'common/modules/adblock-banner'
], function (
    config,
    detect,
    template,
    svgs,
    AdblockBanner
) {

    return function () {

        this.id = 'AdblockStickyBanner';
        this.start = '2015-08-11';
        this.expiry = '2015-08-21';
        this.author = 'Zofia Korcz';
        this.description = 'Test if ad-block users are encouraged to support us by joining membership';
        this.audience = 0.05;
        this.audienceOffset = 0.25;
        this.successMeasure = 'Ad-block users will be interested in becoming a Supporter';
        this.audienceCriteria = 'Users who have ad-block installed and are not on mobile';
        this.dataLinkNames = 'supporter message, read more';
        this.idealOutcome = 'Users will sign up as a Supporter or will turn off the ad-block';

        this.canRun = function () {
            /**
             * Adblock users who are not on mobile.
             */
            return detect.adblockInUse && !detect.getBreakpoint() !== 'mobile';
        };

        this.variants = [{
            id: 'variant',
            test: function () {
                var variations = [
                    {
                        supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=ADBLOCK_BANNER_MONBIOT',
                        quoteText: 'Become a Guardian Member and support independent journalism.',
                        quoteAuthor: 'George Monbiot'
                    },
                    {
                        supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=ADBLOCK_BANNER_MACASKILL',
                        quoteText: 'The Guardian enjoys rare freedom and independence. Support our journalism',
                        quoteAuthor: 'Ewen MacAskill'
                    },
                    {
                        supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=ADBLOCK_BANNER_MUIR',
                        quoteText: 'Support and become part of the Guardian',
                        quoteAuthor: 'Hugh Muir'
                    },
                    {
                        supporterLink: 'https://membership.theguardian.com/about/supporter?INTCMP=ADBLOCK_BANNER_TOYNBEE',
                        quoteText: 'If you read the Guardian. Join the Guardian',
                        quoteAuthor: 'Polly Toynbee'
                    }
                ];
                new AdblockBanner(variations[0]).show();
            }
        },
        {
            id: 'control',
            test: function () {}
        }
        ];

    };

});

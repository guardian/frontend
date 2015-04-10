define([
    'common/utils/$',
    'common/utils/config'
], function (
    $,
    config
) {
    return function () {
        this.id = 'MtTopBelowNav';
        this.start = '2015-03-17';
        this.expiry = '2015-05-17';
        this.author = 'Zofia Korcz';
        this.description = 'Top above nav ad placed below nav';
        this.audience = 0.02;
        this.audienceOffset = 0.1;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.edition === 'US';
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    $('.top-banner-ad-container--above-nav').appendTo('.top-banner-below-nav-mt-test');
                }
            },
            {
                id: 'control',
                test: function () { }
            }
        ];
    };

});

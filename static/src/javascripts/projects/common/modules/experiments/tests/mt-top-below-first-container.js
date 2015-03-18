define([
    'common/utils/$',
    'common/utils/config'
], function (
    $,
    config
) {
    return function () {
        this.id = 'MtTopBelowFirstContainer';
        this.start = '2015-03-18';
        this.expiry = '2015-05-18';
        this.author = 'Zofia Korcz';
        this.description = 'Top above nav ad placed below first container';
        this.audience = 0.01;
        this.audienceOffset = 0.2;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition, only on fronts';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.edition === 'US' && config.page.pageId === 'us';
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    $('.top-banner-ad-container--above-nav').insertAfter('.js-container--first').css('border-bottom', 'none');
                }
            }
        ];
    };

});

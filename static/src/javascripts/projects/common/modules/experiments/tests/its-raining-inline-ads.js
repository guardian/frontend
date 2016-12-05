define([
    'common/modules/commercial/commercial-features'
], function (
    commercialFeatures
) {
    return function () {
        this.id = 'ItsRainingInlineAds';
        this.start = '2016-11-30';
        this.expiry = '2017-01-03';
        this.author = 'Regis Kuckaertz';
        this.description = 'Compare the performance of two inline ad insertion strategies';
        this.audience = .5;
        this.audienceOffset = 0;
        this.successMeasure = 'Advertising revenue will go through the roof';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'We will make Katherine Le Ruez and Theresa Malone extremely happy';
        this.hypothesis = 'The current spacefinder rules are too restrictive and a lot of articles don\'t have a single inline MPU';

        this.canRun = function () {
            return commercialFeatures.articleBodyAdverts;
        };

        var success = function (complete) {
            complete();
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: success.bind(this)
            },
            // In this variant, we leave the geo most popular component there
            // and offset ads in the right-hand column
            {
                id: 'geo',
                test: function () {},
                success: success.bind(this)
            },
            // Here, the geo most pop is removed and ads are offset to the right
            {
                id: 'nogeo',
                test: function () {},
                success: success.bind(this)
            },
            // Here, the geo most pop is removed and ads remain inline
            {
                id: 'none',
                test: function () {},
                success: success.bind(this)
            }
        ];
    };
});

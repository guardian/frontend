define([
    'common/$'
], function (
    $
    ) {

    var adSlot =
        '<div class="ad-slot ad-slot--dfp ad-slot--commercial-component-high" data-link-name="ad slot merchandising-high" data-name="merchandising-high" data-label="false" data-refresh="false" data-desktop="888,87">' +
            '<div id="dfp-ad--merchandising-high" class="ad-slot__container"></div>' +
        '</div>';

    return function () {

        this.id = 'HighRelevanceCommercialComponent';
        this.start = '2014-05-14';
        this.expiry = '2014-05-28';
        this.author = 'Darren Hurley';
        this.description = 'Test position of high relevance commercial component on fronts.';
        this.audience = 0.2;
        this.audienceOffset = 0.5;
        this.successMeasure = 'Click component through/revenue, and container\'s click through.';
        this.audienceCriteria = 'Audience to the fronts';
        this.dataLinkNames = 'High relevance commercial component';
        this.idealOutcome = 'Click through/revenue produced by component increases, without detrimentally impacting click through on containers/';

        this.canRun = function (config) {
            return config.page.contentType === 'Tag' || config.page.isFront;
        };

        this.variants = [
            {
                id: 'second-and-third',
                test: function () {
                    $('.container:nth-child(2)').after(adSlot);
                }
            },
            {
                id: 'third-and-fourth',
                test: function () {
                    $('.container:nth-child(3)').after(adSlot);
                }
            }
        ];
    };

});

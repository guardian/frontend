define([
    'qwery',
    'common/$',
    'common/utils/detect'
], function (
    qwery,
    $,
    detect
    ) {

    var adSlot =
        '<div class="ad-slot ad-slot--dfp ad-slot--commercial-component-high" data-link-name="ad slot merchandising-high" data-name="merchandising-high" data-label="false" data-refresh="false" data-desktop="888,88">' +
            '<div id="dfp-ad--merchandising-high" class="ad-slot__container"></div>' +
        '</div>';

    return function () {

        this.id = 'HighRelevanceCommercialComponent';
        // not starting the test just yet, in now so we can style the component correctly for this spot
        this.start = '2014-05-21';
        this.expiry = '2014-06-04';
        this.author = 'Darren Hurley';
        this.description = 'Test position of high relevance commercial component on fronts.';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Click component through/revenue, and container\'s click through.';
        this.audienceCriteria = 'Audience to the fronts';
        this.dataLinkNames = 'ad slot merchandising-high';
        this.idealOutcome = 'Click through/revenue produced by component increases, without detrimentally impacting click through on containers/';

        this.canRun = function (config) {
            // only apply on fronts with at least 4 containers
            return (config.page.contentType === 'Tag' || config.page.isFront) &&
                qwery('.facia-container section.container').length >= 4 &&
                ['desktop', 'wide'].indexOf(detect.getBreakpoint()) !== -1;
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

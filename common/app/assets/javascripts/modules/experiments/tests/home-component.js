define([
    'qwery',
    'common/$',
    'common/utils/detect',
    'common/modules/experiments/affix'
], function(
    qwery,
    $,
    detect,
    Affix
) {
    var affix = null;

    var homeComponent = function() {

        this.id = 'HomeComponent';
        this.start = '2014-04-08';
        this.expiry = '2014-05-04';
        this.author = 'Richard Nguyen';
        this.description = 'Add a fixed button for users to go back home.';
        this.audience = 0.2;
        this.audienceOffset = 0.8;
        this.successMeasure = 'Improved home journeys';
        this.audienceCriteria = 'Desktop Article pages only';
        this.dataLinkNames = 'home';
        this.idealOutcome = 'Better home page click-through on article, no change on other user journeys.';

        this.canRun = function(config) {
            return config.page.contentType === 'Article' && detect.getBreakpoint() === 'wide';
        };

        this.variants = [
            {
                id: 'control',
                test: function() {}
            },
            {
                id: 'home',
                test: function(context) {

                    $('.home', context).removeClass('u-h');
                    affix = new Affix({
                        element: qwery('.js-home')[0],
                        topMarker: qwery('.top-marker')[0],
                        bottomMarker: qwery('.bottom-marker')[0],
                        containerElement: qwery('.home-container')[0]
                    });
                }
            }
        ];
    };

    return homeComponent;

});
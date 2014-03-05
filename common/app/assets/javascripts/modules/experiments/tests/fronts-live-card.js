define([
    'reqwest',
    'common/utils/detect',
    'common/utils/template'
], function(
    reqwest,
    detect,
    template
) {

    return function() {

        this.id = 'FrontsLiveCard';
        this.start = '2014-02-28';
        this.expiry = '2014-03-08';
        this.author = 'Darren Hurley';
        this.description = 'Add a live card to the news container';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.successMeasure = 'Click-through for the page as a whole.';
        this.audienceCriteria = 'Users who are not on desktop or bigger, on the network front.';
        this.dataLinkNames = 'card | live | trail | {{index}}';
        this.idealOutcome = 'Click-through for the front increases, i.e. the card does not detract from the page\'s CTR.';
        this.canRun = function(config) {
            return ['desktop', 'wide'].indexOf(detect.getBreakpoint()) > -1 && config.page.isFront && config.page.pageId === '';
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) { }
            },
            {
                id: 'latest-reviews',
                test: function (context, config) {
                    reqwest({
                        url: 'http://content.guardianapis.com/search?tag=tone%2Freviews%2Cculture%2Fculture&page-size=3&show-fields=starRating',
                        type: 'jsonp'
                    })
                        .then(function(resp) {
                        });
                }
            }
        ];
    };
});

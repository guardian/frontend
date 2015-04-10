define([
    'common/utils/config',
    'facia/modules/ui/live-blog-updates'
], function (
    config,
    liveblogUpdates
) {

    return function () {
        this.id = 'LiveblogBlocksOnFronts';
        this.start = '2015-04-08';
        this.expiry = '2015-04-23';
        this.author = 'Stephan Fowler';
        this.description = 'Checking effect of showing the latest liveblog blocks on fronts';
        this.audience = 0.2;
        this.audienceOffset = 0.5;
        this.successMeasure = '';
        this.audienceCriteria = 'Front visitors';
        this.dataLinkNames = '';
        this.idealOutcome = 'Higher engagement, measured as increased onward journeys to ANY content on the affected front, or increased dewll time on that front';

        this.canRun = function () {
            return ['football', 'uk/sport', 'us/sport', 'au/sport'].indexOf(config.page.pageId) > -1;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'show',
                test: liveblogUpdates
            }
        ];
    };

});

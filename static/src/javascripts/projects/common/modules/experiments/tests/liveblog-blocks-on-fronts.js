define([
    'common/utils/config',
    'common/utils/detect',
    'facia/modules/ui/live-blog-updates'
], function (
    config,
    detect,
    liveblogUpdates
) {

    return function () {
        this.id = 'LiveblogBlocksOnFronts';
        this.start = '2015-04-08';
        this.expiry = '2015-04-23';
        this.author = 'Stephan Fowler';
        this.description = 'Checking effect of showing the latest liveblog blocks on fronts';
        this.audience = 0.3;
        this.audienceOffset = 0.5;
        this.successMeasure = '';
        this.audienceCriteria = 'Front visitors';
        this.dataLinkNames = '';
        this.idealOutcome = 'Higher engagement, measured as increased onward journeys to ANY content on the affected front, or increased dewll time on that front';

        this.canRun = function () {
            return ['Network Front', 'Section'].indexOf(config.page.contentType) > -1;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'blocks',
                test: liveblogUpdates.showBlocks
            },
            {
                id: 'message',
                test: liveblogUpdates.showMessage
            }
        ];
    };

});

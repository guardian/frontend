define([
    'common/modules/ui/sticky-container-titles',
    'common/utils/config'
], function (
    stickyContainerTitles,
    config
    ) {
    return function () {
        this.id = 'StickyContainerTitles';
        this.start = '2014-12-23';
        this.expiry = '2015-02-01';
        this.author = 'Stephan Fowler';
        this.description = 'Test the value of having visible sticky container titles';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Increased time spent on page';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'sticky container titles';
        this.idealOutcome = 'Users spend more time on page or scroll more';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'show',
                test: function () {
                    if (['Network Front', 'Section'].indexOf(config.page.contentType) > -1) {
                        stickyContainerTitles.init();
                    }
                }
            }
        ];
    };

});

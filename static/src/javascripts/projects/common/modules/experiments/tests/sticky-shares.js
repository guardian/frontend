define([
    'common/utils/config'
], function (
    config
) {

    return function () {
        this.id = 'StickyShares';
        this.start = '2015-05-15';
        this.expiry = '2015-05-28';
        this.author = 'Stephan Fowler';
        this.description = 'Checking sticking the share buttons to the bottom of articles';
        this.audience = 0.2;
        this.audienceOffset = 0.25;
        this.successMeasure = '';
        this.audienceCriteria = 'Article visitors';
        this.dataLinkNames = '';
        this.idealOutcome = 'More sharing of articles';

        this.canRun = function () {
            return config.page.contentType === 'Article';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'sticky',
                test: function () {}
            }
        ];
    };

});

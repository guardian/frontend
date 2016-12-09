define([
    'common/utils/config'
], function () {
    return function () {
        this.id = 'VideoHeadline';
        this.start = '2016-12-08';
        this.expiry = '2017-01-20';
        this.author = 'Chris J Clarke';
        this.description = 'Test whether adding a headline in addition to the new play button increases plays';
        this.showForSensitive = true;
        this.audience = 0.10;
        this.audienceOffset = 0;
        this.successMeasure = 'No significant difference in clicks between the variant and control';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Video plays in the control group is not more than 2% higher';

        this.canRun = function () {
          return document.getElementsByClassName('gu-media-wrapper--video').length > 0;
        };


        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'video-headline',
                test: function () {}
            }
        ];
    };
});

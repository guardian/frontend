define(['qwery',
        'common/utils/config'
], function(
    qwery,
    config

) {
    return function() {
        this.id = 'VideoCaption';
        this.start = '2016-07-18';
        this.expiry = '2016-07-25';
        this.author = 'Gideon Goldberg';
        this.showForSensitive = true;
        this.description = 'Test if increasing the prominence of the video caption on in-article videos leads to more plays.';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Video starts';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.canRun = function() {
            return config.page.contentType === 'Article' &&  qwery('[data-component="main video"]').length > 0;
        };

        this.variants = [
            {
                id: 'baseline1',
                test: function () {
                }
            },
            {
                id: 'baseline2',
                test: function () {
                }
            }
        ];
    };
});

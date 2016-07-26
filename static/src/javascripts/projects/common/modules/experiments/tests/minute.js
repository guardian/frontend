define(['qwery',
    'common/utils/config'
], function(
    qwery,
    config

) {
    return function() {
        this.id = 'Minute';
        this.start = '2016-07-26';
        this.expiry = '2016-09-01';
        this.author = 'Gideon Goldberg';
        this.showForSensitive = true;
        this.description = 'Test if minute video teaser causes more video plays.';
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
                id: 'control',
                test: function () {
                }
            },
            {
                id: 'minute',
                test: function () {
                }
            }
        ];
    };
});

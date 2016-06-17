define([
    'qwery',
    'common/utils/config'
], function (
    qwery,
    config
) {
    return function () {
        this.id = 'VideoMainMediaAlwaysShowcase';
        this.start = '2016-06-15';
        this.expiry = '2016-06-21';
        this.author = 'Akash Askoolum';
        this.description = 'Test if a big main media video leads to more plays';
        this.showForSensitive = true;
        this.audience = 0.1;
        this.audienceOffset = 0.9;
        this.successMeasure = '';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.contentType === 'Article'
                && qwery('[data-component="main video"]').length > 0;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'variant',
                test: function () {}
            }
        ];
    };
});

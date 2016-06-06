define([
    'qwery',
    'common/utils/config'
], function (
    qwery,
    config
) {
    return function () {
        this.id = 'VideoShowcaseMainMedia';
        this.start = '2016-06-07';
        this.expiry = '2016-06-14';
        this.author = 'Akash Askoolum';
        this.description = 'Test if a big main media video leads to more plays';
        this.showForSensitive = true;
        this.audience = 1;
        this.audienceOffset = 0;
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
                id: 'baseline1',
                test: function () {}
            },
            {
                id: 'baseline2',
                test: function () {}
            }
        ];
    };
});

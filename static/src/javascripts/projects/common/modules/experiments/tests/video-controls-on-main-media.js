define([
    'qwery',
    'common/utils/config'
], function (
    qwery,
    config
) {
    return function () {
        this.id = 'VideoControlsOnMainMedia';
        this.start = '2016-05-19';
        this.expiry = '2016-05-26';
        this.author = 'James Gorrie';
        this.description = 'Showing controls on main media.';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Landing on an article with main media';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.contentType === 'Article' && qwery('[data-component-type="main video"]').length > 0;
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


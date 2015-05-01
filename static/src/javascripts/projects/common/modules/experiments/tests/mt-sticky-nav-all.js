define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    fastdom,
    $,
    _,
    config,
    detect,
    mediator
) {
    return function () {
        this.id = 'MtStNav';
        this.start = '2015-04-26';
        this.expiry = '2015-05-26';
        this.author = 'Steve Vadocz';
        this.description = 'Top navigation and top ad slot are sticky with navigation going to slim mode';
        this.audience = 0.02;
        this.audienceOffset = 0.35;
        this.successMeasure = '';
        this.audienceCriteria = '1% of US edition';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.edition === 'US';
        };

        this.variants = [
            {
                id: 'A',
                test: function () { }
            },
            {
                id: 'B',
                test: function () { }
            }
        ];
    };
});

define([
    'common/modules/onward/history-containers',
    'common/utils/config',
    'common/utils/detect'
], function (
    historyContainers,
    config,
    detect
    ) {
    return function () {
        this.id = 'HistoryContainers';
        this.start = '2014-12-23';
        this.expiry = '2015-02-01';
        this.author = 'Sébastien Cevey';
        this.description = 'Test the value of personalised containers based on history';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Click-through to content in the personalised containers';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'history containers';
        this.idealOutcome = 'Users click through to more content as it is relevant to them';

        var isNetworkFront = config.page.contentType === 'Network Front';

        this.canRun = function () {
            return detect.isModernBrowser() && isNetworkFront && historyContainers.hasContainers();
        };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'show',
                test: function () {
                    if (isNetworkFront) {
                        historyContainers.injectContainers();
                    }
                }
            }
        ];
    };

});

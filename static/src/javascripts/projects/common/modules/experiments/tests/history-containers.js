define([
    'common/modules/onward/history-containers',
    'common/utils/config'
], function (
    historyContainers,
    config
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
                    if (config.page.contentType === 'Network Front') {
                        historyContainers.injectContainers();
                    }
                }
            }
        ];
    };

});

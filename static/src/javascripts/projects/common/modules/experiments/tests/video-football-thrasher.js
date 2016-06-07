define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'VideoFootballThrasher';
        this.start = '2016-06-07';
        this.expiry = '2016-06-14';
        this.author = 'Ben Longden';
        this.description = 'Test between two thrashers';
        this.showForSensitive = true;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'People on football front';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return document.querySelector('.guardianVideo__wrapper') && config.page.pageId === 'football';
        };

        this.variants = [
            {
                id: 'thrasher1',
                test: function () {}
            },
            {
                id: 'thrasher2',
                test: function () {
                    var thrasher1 = document.querySelector('guardian__video--wrapper');
                    var thrasher2 = document.querySelector('leicester__video--wrapper');
                    
                    thrasher1.style.display = 'none';
                    thrasher2.style.display = 'block';
                }
            }
        ];
    };
});

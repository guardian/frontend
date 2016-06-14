define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/storage'
], function (
    config,
    detect,
    storage
) {
    return function () {

        this.id = 'SmartBanner';
        this.start = '2016-05-18';
        this.expiry = '2016-06-10';
        this.author = 'Maria Livia Chiorean';
        this.description = 'Show Apple's smart banner.';
        this.audience = 0;
        this.audienceOffset = 0;
        this.audienceCriteria = '';
        this.idealOutcome = 'More app installs.';

        this.canRun = function () {
            return true;
        };

        this.variants = [{
            id: 'control',
            test: function () {
            }
        }, {
            id: 'smart-banner',
            test: function () {
            }
        }];

    };

});

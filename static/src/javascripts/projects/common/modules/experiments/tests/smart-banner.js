define([
    'common/utils/config',
    'common/utils/detect'
], function (
    config,
    detect
) {
    return function () {

        this.id = 'SmartBanner';
        this.start = '2016-05-18';
        this.expiry = '2016-08-01';
        this.author = 'Maria Livia Chiorean';
        this.description = 'Show the Apple smart banner.';
        this.audience = 0;
        this.audienceOffset = 0;
        this.audienceCriteria = '';
        this.idealOutcome = 'More app installs.';

        this.canRun = function () {
            return true; //detect.isIOS();
        };

        this.variants = [{
            id: 'control',
            test: function () { }
        }, {
            id: 'smart-banner',
            test: function () { }
        }];

    };

});

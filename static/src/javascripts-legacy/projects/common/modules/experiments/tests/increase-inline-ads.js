define([
    'lib/config',
    'lib/detect'
], function (config, detect) {
    return function () {
        this.id = 'IncreaseInlineAds';
        this.start = '2017-03-10';
        this.expiry = '2017-03-24';
        this.author = 'Regis Kuckaertz';
        this.description = 'Displays more inline ads in articles on desktop';
        this.audience = .05;
        this.audienceOffset = 0;
        this.successMeasure = 'Our inventory has increased';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'Viewability and user engagement has not been impacted';
        this.showForSensitive = true;

        this.canRun = function () {
          return !config.page.isImmersive && detect.isBreakpoint({ min: 'desktop' });
        };

        this.variants = [
            {
                id: 'yes',
                test: function () {}
            },
            {
                id: 'no',
                test: function () {}
            }
        ];
    };
});

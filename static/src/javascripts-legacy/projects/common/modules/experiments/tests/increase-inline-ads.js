define([
    'lib/config',
    'lib/detect'
], function (config, detect) {
    return function () {
        this.id = 'IncreaseInlineAdsRedux';
        this.start = '2017-04-12';
        this.expiry = '2017-05-17';
        this.author = 'Gideon Goldberg';
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

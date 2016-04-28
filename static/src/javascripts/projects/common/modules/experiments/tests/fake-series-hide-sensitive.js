define([], function () {
    return function () {
        this.id = 'FakeSeriesHideSensitive';
        this.start = '2016-04-27';
        this.expiry = '2016-04-29';
        this.author = 'Sam Desborough';
        this.description = 'A fake test to target series content that\'s hidden on sensitive articles';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            return !!window.guardian.config.page.seriesId;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'variant',
                test: function () {}
            }
        ];
    };
});

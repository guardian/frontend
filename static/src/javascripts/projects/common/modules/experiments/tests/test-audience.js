define([], function () {

    return function () {
        var module = this;

        this.id = 'testAudience';
        this.start = '2016-06-13';
        this.expiry = '2016-06-21';
        this.author = 'Gareth Trufitt';
        this.description = 'Test the audience sample';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Control - Page views';
        this.audienceCriteria = 'Everyone.';
        this.dataLinkNames = '';
        this.idealOutcome = 'Total page views should match samples';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {},
                success: function (complete) {
                    if (module.canRun()) {
                        complete();
                    }
                }
            }
        ];
    };
});

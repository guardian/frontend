define([
], function (

    ) {

    return function () {
        this.id = 'LargerMobileMpu';
        this.start = '';
        this.expiry = '';
        this.author = 'Darren Hurley';
        this.description = '';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    // do nothing
                }
            },
            {
                id: '300x250',
                test: function () {
                }
            }
        ];
    };

});

define(function () {

    return function () {
        this.id = 'HighCommercialComponent';
        this.start = '2014-07-09';
        this.expiry = '2015-07-09';
        this.author = 'Darren Hurley';
        this.description = 'Increase the size of inline1 ad slot to 300x250 for mobile users';
        this.audience = 0.1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        /**
         * nothing happens in here, we just use this to bucket users
         */
        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'variant',
                test: function () { }
            }
        ];
    };

});
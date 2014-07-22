define(function () {

    return function () {
        this.id = 'HighCommercialComponent';
        this.start = '2014-07-22';
        // far future expiration, only really using the test to bucket users, which we can use for targeting in dfp
        this.expiry = '2015-07-09';
        this.author = 'Darren Hurley';
        this.description = 'Using as a DFP targeting hook to test different high relevance components';
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

define(function () {

    return function () {
        this.id = 'KruxAudienceScience';
        this.start = '2015-02-06';
        this.expiry = '2015-03-06';
        this.author = 'Sam Desborough';
        this.description = 'Using Krux rather than Audience Science parameters in DFP ad requests';
        this.audience = 0.04;
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

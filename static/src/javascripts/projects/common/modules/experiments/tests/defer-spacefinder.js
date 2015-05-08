define(function () {

    return function () {
        this.id = 'DeferSpacefinder';
        this.start = '2015-04-30';
        this.expiry = '2015-05-25';
        this.author = 'Zofia Korcz';
        this.description = 'Defer execution of spacefinder until images and richlinks have been loaded.';
        this.audience = 0.02;
        this.audienceOffset = 0.01;
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
                id: 'A',
                test: function () { }
            },
            {
                id: 'B',
                test: function () { }
            }
        ];
    };

});

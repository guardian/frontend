define(function () {

    return function () {
        this.id = 'DeferSpacefinder';
        this.start = '2015-03-31';
        this.expiry = '2015-04-30';
        this.author = 'Sam Desborough';
        this.description = 'Defer execution of spacefinder until images and richlinks have been loaded.';
        this.audience = 1;
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
                id: 'variant',
                test: function () { }
            }
        ];
    };

});

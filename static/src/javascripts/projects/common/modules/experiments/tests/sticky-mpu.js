define(function () {

    return function () {
        this.id = 'StickyMpu';
        this.start = '2015-03-09';
        this.expiry = '2015-05-09';
        this.author = 'Zofia Korcz';
        this.description = 'Sticky mpu everywhere where possible instead of the standard RH mpu';
        this.audience = 0.05;
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

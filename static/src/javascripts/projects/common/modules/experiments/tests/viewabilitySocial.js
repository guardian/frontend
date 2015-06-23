define(function () {

    return function () {
        this.id = 'ViewabilitySocial';
        this.start = '2015-06-23';
        this.expiry = '2015-08-01';
        this.author = 'Stephan Fowler';
        this.description = 'Viewability - Adds social buttons to the sticky nav; requires Viewability to be running.';
        this.audience = 0;
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
                test: function () {}
            },
            {
                id: 'variant',
                test: function () {}
            }
        ];
    };

});

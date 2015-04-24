define(function () {

    return function () {
        this.id = 'VariantTest';
        this.start = '2015-04-24';
        this.expiry = '2015-05-01';
        this.author = 'Oliver Ash';
        this.description = 'Test for the test framework to see whether the variant traffic distribution is correct.';
        this.audience = 0.2;
        this.audienceOffset = 0.5;
        this.successMeasure = 'Traffic distribution is equal across variants';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Traffic distribution is equal across variants';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'A',
                test: function () {}
            },
            {
                id: 'B',
                test: function () {}
            },
            {
                id: 'C',
                test: function () {}
            },
            {
                id: 'D',
                test: function () {}
            }
        ];
    };

});

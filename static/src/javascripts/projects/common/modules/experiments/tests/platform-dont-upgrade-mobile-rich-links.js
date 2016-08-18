define([], function () {
    return function () {
        this.id = 'DontUpgradeMobileRichLinks';
        this.start = '2016-08-18';
        this.expiry = '2016-09-14';
        this.author = 'Gareth Trufitt';
        this.description = 'Test whether the loyalty of users decreases with non-enhanced rich links';
        this.audience = 0.5;
        this.audienceOffset = 0;
        this.successMeasure = 'Loyalty of users';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Loyalty of users doesn\'t decrease';



        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'no-upgrade',
                test: function () {}
            }
        ];
    };
});

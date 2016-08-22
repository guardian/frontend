define([], function () {
    return function () {
        this.id = 'DontUpgradeMobileRichLinks';
        this.start = '2016-08-18';
        this.expiry = '2016-09-14';
        this.author = 'Gareth Trufitt';
        this.description = 'Test whether the loyalty of users decreases with non-enhanced rich links';
        this.audience = 0.4;
        this.audienceOffset = 0.2;
        this.successMeasure = 'No major drop in overall article page CTR & no major drop in article visits per browser per day';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Happier users & no major drop in article visits per browser per day';
        
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

define([], function () {
    return function () {
        this.id = 'LiveblogSportFrontUpdates';
        this.start = '2015-04-27';
        this.expiry = '2015-05-27';
        this.author = 'Stephan Fowler';
        this.description = 'Checking effect of showing the latest liveblog blocks on sport & fronts';
        this.audience = 0.2;
        this.audienceOffset = 0.5;
        this.successMeasure = '';
        this.audienceCriteria = 'Front visitors';
        this.dataLinkNames = '';
        this.idealOutcome = 'Higher engagement, measured as increased onward journeys to ANY content on the affected front, or increased dewll time on that front';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'updates',
                test: function() {}
            }
        ];
    };

});

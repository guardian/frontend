define(function () {

    return function () {
        this.id = 'StickySocial';
        this.start = '2015-07-20';
        this.expiry = '2015-07-30';
        this.author = 'Stephan Fowler';
        this.description = 'Adds social buttons to the sticky nav';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Increased shares on content pages';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'More page views due to increased shares';

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

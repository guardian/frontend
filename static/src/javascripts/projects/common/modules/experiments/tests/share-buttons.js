define([], function () {

    return function () {
        this.id = 'ShareButtons';
        this.start = '2015-05-21';
        this.expiry = '2015-05-28';
        this.author = 'Stephan Fowler';
        this.description = 'Combinations of referrer-based size, visibility, and stickiness for share buttons';
        this.audience = 0.1;
        this.audienceOffset = 0.4;
        this.successMeasure = 'Sharing rate per article';
        this.audienceCriteria = 'Article visitors';
        this.dataLinkNames = '';
        this.idealOutcome = 'More sharing of articles';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'sticky',
                test: function () {}
            },
            {
                id: 'referrer',
                test: function () {}
            },
            {
                id: 'sticky-referrer',
                test: function () {}
            },
            {
                id: 'sticky-referrer-only',
                test: function () {}
            }
        ];
    };

});

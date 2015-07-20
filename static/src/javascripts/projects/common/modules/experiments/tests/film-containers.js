define([], function () {
    function noop() {}

    return function () {
        this.id = 'FilmContainers';
        this.start = '2015-07-16';
        this.expiry = '2015-07-30';
        this.author = 'Stephan Fowler';
        this.description = 'Extra containers on Film content';
        this.audience = 0.45;
        this.audienceOffset = .5;
        this.successMeasure = 'Engagement with Film content pages';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'More engagement with Film content pages';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: noop
            },
            {
                id: 'curated',
                test: noop
            },
            {
                id: 'news',
                test: noop
            }
        ];
    };
});

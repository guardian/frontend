define([], function () {
    function noop() {}

    return function () {
        this.id = 'Pintrest';
        this.start = '2015-07-01';
        this.expiry = '2015-07-16';
        this.author = 'Stephan Fowler';
        this.description = 'Page-level Pintrest buttons on content pages';
        this.audience = 0.1;
        this.audienceOffset = 0.9;
        this.successMeasure = 'Pintrest shares per visit';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = 'More Pintrest shares per visit, in turn leading to more Pintrest referrals.';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: noop
            },
            {
                id: 'variant',
                test: noop
            }
        ];
    };
});

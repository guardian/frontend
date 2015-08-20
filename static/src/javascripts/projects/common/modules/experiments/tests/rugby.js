define([
    'bootstraps/sport'
], function (
    sport,
) {

    return function () {

        this.id = 'RugbyScores';
        this.start = '';
        this.expiry = '';
        this.author = '';
        this.description = '';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'everyone';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [{
            id: 'variant',
            test: function () {
                sport.rugby();
            }
        }];

    };

});

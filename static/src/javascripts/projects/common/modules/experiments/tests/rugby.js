define([
    'bootstraps/sport'
], function (
    sport
) {

    return function () {

        this.id = 'RugbyScores';
        this.start = '2015-08-21';
        this.expiry = '2015-08-28';
        this.author = 'Jenny Sivapalan';
        this.description = 'Scores for the Rugby World Cup to be loaded in on live blogs / reports etc';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'More users will come to Guadian for live updates.';
        this.audienceCriteria = 'everyone';
        this.dataLinkNames = '';
        this.idealOutcome = 'More users will come to Guadian for live updates.';

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

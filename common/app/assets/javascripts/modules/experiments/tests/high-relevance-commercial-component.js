define([], function () {

    return function () {

        this.id = 'HighRelevanceCommercialComponent';
        this.start = '2014-05-14';
        this.expiry = '2014-05-28';
        this.author = 'Darren Hurley';
        this.description = 'Test position of high relevance commercial component on fronts.';
        this.audience = 0.2;
        this.audienceOffset = 0.5;
        this.successMeasure = 'Click component through/revenue, and container\'s click through.';
        this.audienceCriteria = 'Audience to the fronts';
        this.dataLinkNames = 'High relevance commercial component';
        this.idealOutcome = 'Click through/revenue produced by component increases, without detrimentally impacting click through on containers/';

        this.canRun = function (config) {
            return config.page.contentType === 'Tag' || config.page.isFront;
        };

        this.variants = [
            {
                id: 'second-and-third',
                test: function () { }
            },
            {
                id: 'third-and-fourth',
                test: function () { }
            }
        ];
    };

});

define(['bonzo'], function (bonzo) {

    var ExperimentRelatedContent = function () {

        var mostPopular = bonzo('popular-trails');

        this.id = 'related-content';
        this.audience = 0.01;
        this.description = 'Hides related content block on article to see if increases click through on most popular';
        this.canRun = function(config) {
          return (config.page.contentType === "Article") ? true : false;
        };
        this.variants = [
            {
                id: 'control',
                split: 50,
                test: function () {
                    var data = 'Related content test : show : ' + mostPopular.data('link-name');
                    mostPopular.data('link-name', data);
                }
            },
            {
                id: 'hide',
                split: 50,
                test: function () {
                    bonzo('#js-related').remove();
                    var data = 'Related content test : hide : ' + mostPopular.data('link-name');
                    mostPopular.data('link-name', data);
                }
            }
        ];
    };

    return ExperimentRelatedContent;

});

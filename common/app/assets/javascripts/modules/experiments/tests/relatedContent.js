define(['bonzo'], function (bonzo) {

    var ExperimentRelatedContent = function () {

        this.id = 'RelatedContentV2';
        this.audience = 1;
        this.description = 'Hides related content block on article to see if increases click through on most popular';
        this.canRun = function(config) {
          return (config.page.contentType === "Article" && document.querySelector('.js-related')) ? true : false;
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'hide',
                test: function () {
                    bonzo(document.querySelector('.js-related')).hide();
                }
            }
        ];
    };

    return ExperimentRelatedContent;

});

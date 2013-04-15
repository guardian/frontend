define(['bonzo'], function (bonzo) {

    var ExperimentRelatedContent = function () {

        var self = this;

        this.id = 'relatedContent';
        this.audience = 1;
        this.description = 'Hides related content block on article to see if increases click through on most popular';
        this.canRun = function(config) {
          return (config.page.contentType === "Article") ? true : false;
        };
        this.variants = [
            {
                id: 'control',
                split: 50,
                test: function () {
                    var mostPopular =  bonzo(document.getElementById('popular-trails')),
                        data = 'AB | ' + self.id + ' test | show | ' + mostPopular.attr('data-link-name');

                    mostPopular.attr('data-link-name', data);
                }
            },
            {
                id: 'hide',
                split: 50,
                test: function () {
                    var mostPopular =  bonzo(document.getElementById('popular-trails'));
                    bonzo(document.getElementById('js-related')).remove();
                    var data = 'AB | ' + self.id + ' test | hide | '  + mostPopular.attr('data-link-name');
                    mostPopular.attr('data-link-name', data);
                }
            }
        ];
    };

    return ExperimentRelatedContent;

});

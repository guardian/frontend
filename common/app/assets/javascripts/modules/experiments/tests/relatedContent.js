define([], function () {

    var ExperimentRelatedContent = function () {

        this.id = 'related-content';
        this.description = 'Hides related content block on article to see if increases click through on most popular';
        this.variants = [
            { id: 'control',    split: 50,  test: function () { }},
            { id: 'hide',       split: 50, test: function () {


            }}
        ];
    };

    return ExperimentRelatedContent;

});

define(['modules/story/frontstories'], function (FrontStories) {

    var ExperimentRelatedContent = function () {

        this.id = 'LocalElectionStory';
        this.audience = 0.5;
        this.description = 'Swap out the first local-elections tagged trail with the story component';
        this.canRun = function(config) {
          return true;
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
                    var frontStories = new FrontStories();
                    frontStories.init();
                }
            }
        ];
    };

    return ExperimentRelatedContent;

});

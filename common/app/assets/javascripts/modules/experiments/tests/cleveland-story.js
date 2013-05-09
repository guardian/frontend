define(['modules/story/frontstories'], function (FrontStories) {

    var LocalElectionStory = function () {
        
        var storyId = '680026';

        this.id = 'ClevelandStory';
        this.audience = 0.1;
        this.description = 'Swap out the first cleveland tagged trail with the story component';
        this.canRun = function(config) {
            // only run on network front
            return config.page.pageId === '';
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'swap',
                test: function () {
                    new FrontStories({ storyId: storyId }).init();
                }
            }
        ];
    };

    return LocalElectionStory;

});

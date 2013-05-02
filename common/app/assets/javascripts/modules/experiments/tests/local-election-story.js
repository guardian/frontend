define(['modules/story/frontstories'], function (FrontStories) {

    var LocalElectionStory = function () {

        this.id = 'LocalElectionStory';
        this.audience = 1;
        this.description = 'Swap out the first local-elections tagged trail with the story component';
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
                    new FrontStories().init();
                }
            }
        ];
    };

    return LocalElectionStory;

});

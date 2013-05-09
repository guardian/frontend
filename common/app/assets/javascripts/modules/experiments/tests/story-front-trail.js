define(['modules/story/frontstories'], function (FrontStories) {

    var StoryFrontTrail = function () {
        
        var storyId = '461854';

        this.id = 'StoryFrontTrail';
        this.audience = 1;
        this.description = 'Swap out the first appropriately tagged trail with the story component';
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

    return StoryFrontTrail;

});

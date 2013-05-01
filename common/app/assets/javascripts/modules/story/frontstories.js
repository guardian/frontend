define([
    "common",
    "ajax",
    'modules/storage'
], function(
    common,
    ajax,
    storage
) {

    function FrontStories() {

        var override = storage.get('gu.storyfronttrails') === 'on',
            self = this;

        this.init = function (config) {
            if (config.switches.storyFrontTrails || override) {
                this.load();
            }
        };

        // View
        this.view = {
            render: function (json) {
                var trail = document.querySelectorAll('.trail')[0],
                    // pull out first trail
                    firstStory = /^<li.*?<\/li>/.exec(json.html)[0];
                common.$g(trail).after(firstStory);
            }
        };

        this.load = function () {
            return ajax({
                url: '/stories/articles',
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showStoryTrails',
                success: function (json) {
                    if (json) {
                        self.view.render(json);
                    }
                }
            });
        };
    }
    
    return FrontStories;

});

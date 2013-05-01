define([
    "bonzo",
    "ajax",
    'modules/storage'
], function(
    bonzo,
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
                // NOTE: hard-coded to replace first trail tagged with 'politics/local-elections' - REMOVE ME AFTER TEST
                var trail = document.querySelector('.trail[data-trail-tags*="politics/local-elections"]'),
                    // pull out first trail
                    firstStory = /^<li.*?<\/li>/.exec(json.html);
                if (firstStory) {
                    if (trail) {
                        // replace
                        bonzo(trail).replaceWith(firstStory[0]);
                    } else {
                        // otherwise bung in second position
                        bonzo(document.querySelector('.trail')).after(firstStory[0]);
                    }
                }
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

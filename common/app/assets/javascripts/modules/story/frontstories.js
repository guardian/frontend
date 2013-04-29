define([
    "common",
    "ajax",
    'modules/local-storage'
], function(
    common,
    ajax,
    localStorage
) {

    function FrontStories() {

        var override = localStorage.get('gu.storyfronttrails') === 'on',
            self = this;

        this.init = function (config) {
            if (config.switches.storyFrontTrails || override) {
                this.load();
            }
        };

        // View
        this.view = {
            render: function (json) {
                var trail = document.querySelectorAll('.trail')[0];
                common.$g(trail).after(json.html);
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
                },
                error: function () {
                }
            });
        };
    }
    
    return FrontStories;

});

define([
    "common",
    "ajax"
], function(
    common,
    ajax
) {

    function FrontStories() {

        var override = localStorage.getItem('gu.storyfronttrails') === 'on',
            self = this;

        this.init = function (config) {
            if (config.switches.storyFrontTrails || override) {
                this.load();
            }
        };

        // View
        this.view = {
            render: function (json) {
                common.$g('#front-container').prepend(json.html);
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

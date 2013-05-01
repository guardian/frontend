/*global guardian:true */
define([
    'common',
    "bonzo",
    "ajax",
    'modules/storage'
], function(
    common,
    bonzo,
    ajax,
    storage
) {

    function FrontStories() {

        var override = storage.get('gu.storyfronttrails') === 'on',
            self = this;

        this.init = function () {
            if (guardian.config.switches.storyFrontTrails || override) {
                this.load();
            }
        };

        // View
        this.view = {
            render: function (json) {
                // NOTE: hard-coded to replace first trail tagged with 'politics/local-elections' - REMOVE ME AFTER TEST
                var trail = document.querySelector('.trail[data-trail-tags*="politics/local-elections"]'),
                    firstStory = bonzo.create(json.html)[0];
                if (firstStory) {
                    if (trail) {
                        var $trail = bonzo(trail);
                        // if this is the featured trail (i.e. the first one), need to keep it featured
                        // NOTE: hacky, endpoint should return 'featured' version
                        if ($trail.previous().length === 0) {
                            // update title
                            common.$g('h2 a', trail).text(
                                common.$g('h2 a', firstStory).text()
                            );
                            // update links
                            common.$g('a', trail).attr(
                                'href', common.$g('a', firstStory).attr('href')
                            );
                            // update text
                            common.$g('.trail-text', trail).text(
                                common.$g('.trail-text', firstStory).text()
                            );
                            // update image
                            common.$g('img', trail).attr(
                                'src', common.$g('img', firstStory).attr('src')
                            );
                            // update timestamp
                            common.$g('.relative-timestamp', trail).replaceWith(
                                common.$g('.relative-timestamp', firstStory)
                            );
                            // add story title
                            common.$g('h2', trail).before(
                                common.$g('.trail-story-title', firstStory)
                            );
                        } else {
                            // otherwise a straight replace
                            $trail.replaceWith(firstStory);
                        }
                    } else {
                        // otherwise bung in second position
                        bonzo(document.querySelector('.trail')).after(firstStory);
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

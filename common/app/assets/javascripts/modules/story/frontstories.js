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

    function FrontStories(options) {
        
        var opts = options || {},
            storyId = opts.storyId,
            override = storage.get('gu.storyfronttrails') === 'on',
            self = this;

        this.init = function () {
            if (guardian.config.switches.storyFrontTrails || override) {
                this.load();
            }
        };

        // View
        this.view = {
            render: function (json) {
                var firstStory = bonzo.create(json.html)[0];
                if (!firstStory) {
                    return;
                }
                // should we replace a trail (should have data-link-name front-story)?
                var trail = document.querySelector('section:first-child .trail[data-link-name*="front-story"]');
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
                        var $img = common.$g('img', firstStory);
                        common.$g('img', trail).attr({
                            'src': $img.attr('src'),
                            'alt': $img.attr('alt'),
                        });
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
                    // otherwise bung in last position
                    bonzo(document.querySelector('.trail:last-child')).after(firstStory);
                }
            }
        };

        this.load = function () {
            var url = '/stories/articles';
            if (storyId) {
                url += '?storyId=' + storyId;
            }
            return ajax({
                url: url,
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

define(['common', 'ajax', 'bonzo', 'bootstraps/story'], function (common, ajax, bonzo, story) {
    
    var _context,
        _omnitureListeners;
    
    function fetchStory(storyId) {
        ajax({
            url: '/stories/' + storyId,
            type: 'jsonp',
            jsonpCallbackName: 'story',
            success: function (response) {
                if (!response) {
                    return;
                }
                common.$g('.parts__body', _context).html(response.html);
                
                story.init(response.config, _context);
                // fire omniture
                _omnitureListeners.forEach(function(listener) {
                    listener(response.config, _context);
                });
            }
        });
    }
    
    function fetchStoriesArticles() {
        ajax({
            url: '/stories/articles',
            type: 'jsonp',
            jsonpCallbackName: 'storiesArticles',
            success: function (response) {
                if (!response) {
                    return;
                }
                // are we on one of these articles
                var currentUrl = window.location.pathname,
                    storiesArticles = bonzo.create(response.html);
                for(var i = 0; i < storiesArticles.length; i++) {
                    var $articleLink = common.$g('h2 a', storiesArticles[i]),
                        articleUrl = $articleLink.attr('data-article-url');
                    if (currentUrl === articleUrl) {
                        // pull in story
                        fetchStory($articleLink.attr('href').split('/')[2]);
                        return true;
                    }
                }
            }
        });
    }

    var StoryArticleSwap = function () {
        
        this.id = 'StoryArticleSwapV2';
        this.audience = 1;
        this.description = 'Swap the latest article within the story with the story itself';
        this.canRun = function(config, context) {
            _context = context;
            // only run on article pages (and if switch is on)
            return config.page.contentType === 'Article' && config.switches.storyArticleSwap === true;
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                    return true;
                }
            },
            {
                id: 'test',
                test: function () {
                    // don't fire off omniture tracking
                    _omnitureListeners = common.mediator.getListeners('page:common:deferred:loaded:omniture');
                    common.mediator.removeEvent('page:common:deferred:loaded:omniture');
                    // pull in stories' latest article
                    fetchStoriesArticles();
                }
            }
        ];
    };

    return StoryArticleSwap;

});

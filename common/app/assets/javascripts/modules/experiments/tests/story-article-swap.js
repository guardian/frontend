define(['common', 'ajax', 'bonzo', 'bootstraps/story'], function (common, ajax, bonzo, story) {
    
    var _config,
        _context;
    
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
                
                story.init(_config, _context);
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
        
        this.id = 'StoryArticleSwap';
        this.audience = 1;
        this.description = 'Swap the latest article within the story with the story itself';
        this.canRun = function(config, context) {
            _config = config;
            _context = context;
            // only run on article pages
            return config.page.contentType === 'Article';
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
                    // pull in stories' latest article
                    fetchStoriesArticles();
                }
            }
        ];
    };

    return StoryArticleSwap;

});

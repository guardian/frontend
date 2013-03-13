define([
    "common",
    "bean",
    "ajax",

    "modules/accordion",
    "modules/expandable",
    "modules/story/storytype"
], function(
    common,
    bean,
    ajax,

    Accordion,
    Expandable,
    StoryType
) {

    var modules = {
        initAccordion: function () {
            if(document.querySelector('.accordion')) {
                var a = new Accordion();
            }
        },

        initTimeline: function() {
            var $ = common.$g,
                timeline = document.querySelector('.timeline'),
                eventType = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';

            if(timeline) {
                $('.event-children').addClass('h');
                $('.event-children').first().removeClass('h');
                bean.on(timeline, eventType, '.date-line', function(e) {
                    var block = $(this).parent();
                    $('.event-children', block).toggleClass('h');
                });
            }
        },

        initExpandables: function() {
            var els = document.querySelectorAll('.expandable');

            for(var i = 0, l = els.length; i < l; i++) {
                var id = els[i].id;
                var e = new Expandable({id: id, expanded: false});
                e.init();
            }
        },

        loadMoreStories: function(storyId) {
            var aside = document.getElementById('js-latest-stories');

            if(aside) {
                ajax({
                    url: '/stories',
                    type: 'jsonp',
                    data: { storyId: storyId},
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'showLatestStories',
                    success: function (json) {
                        if(json && json.html) {
                            aside.innerHTML = json.html;
                        }
                    },
                    error: function () {
                        common.mediator('module:error', 'Failed to load latest stories', 'story.js');
                    }
                });
            }
        },

        loadPageType: function(storyId, config) {
            var pageType = localStorage.getItem('gu.storypage') || '';

            if (!pageType) {
                for (var key in config.switches) {
                    if (config.switches[key] && key.match(/^storypage(\w+)/)) {
                        pageType = key.match(/^storypage(\w+)/)[1];
                        break;
                    }
                }
            }

            pageType = pageType.toLowerCase();

            if (pageType) {
                common.mediator.on('module:storytype:loaded', function() {
                    common.mediator.emit('modules:tabs:render', '#js-story-tabs');
                    new Expandable({id: "js-agents", expanded: false}).init();
                });

                new StoryType({
                    id: storyId,
                    type: pageType
                }).init();
            }
        }
    };

    var init = function(req, config) {
        var storyId = config.page.pageId.replace("stories/", "");

        modules.initAccordion();
        modules.initTimeline();
        modules.initExpandables();
        modules.loadMoreStories(storyId);
        modules.loadPageType(storyId, config);
    };

    return {
        init: init
    };
});

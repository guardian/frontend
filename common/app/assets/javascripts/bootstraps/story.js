define([
    "common",
    "bean",
    "ajax",

    "modules/accordion",
    "modules/expandable"
], function(
    common,
    bean,
    ajax,

    Accordion,
    Expandable
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

        loadMoreStories: function(config) {
            var aside = document.getElementById('js-latest-stories');

            if(aside) {
                var storyId = config.page.pageId.replace("stories/", "");
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
        }
    };

    var init = function(req, config) {
        modules.initAccordion();
        modules.initTimeline();
        modules.initExpandables();
        modules.loadMoreStories(config);
    };

    return {
        init: init
    };
});

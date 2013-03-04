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
            var timeline = document.querySelector('.timeline'),
                eventType = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';

            if(timeline) {
                common.$g('.event-articles').addClass('h');
                bean.on(timeline, eventType, '.date-line', function(e) {
                    var block = common.$g(this).parent();
                    common.$g('.event-articles', block).toggleClass('h');
                });
            }
        },

        initAgents: function() {
            var agentsExpandable = new Expandable({ id: 'js-agents', expanded: false });
            agentsExpandable.init();
        },

        loadMoreStories: function() {
            var aside = document.getElementById('js-latest-stories');

            if(aside) {
                ajax({
                    url: '/stories',
                    type: 'jsonp',
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
        modules.initAgents();
        modules.loadMoreStories();
    };

    return {
        init: init
    };
});

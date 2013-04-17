define([
    "common",
    "bean",
    "ajax",

    "modules/accordion",
    "modules/expandable",
    "modules/story/storytype",
    "modules/story/continue-reading"
], function(
    common,
    bean,
    ajax,

    Accordion,
    Expandable,
    StoryType,
    ContinueReading
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
                bean.on(timeline, eventType, '.event-title', function(e) {
                    var block = $(this).parent();
                    $('.event-summary', block).toggleClass('h');
                    $('.event-children', block).toggleClass('h');
                    $('i', block).toggleClass('is-open');
                });
            }
        },

        initAgents: function() {
          var eventType = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click',
              agents = document.querySelector('.story-agents');

          common.$g('.agent-body', agents).addClass('h');
          common.$g('button', agents).removeClass('h');

          common.$g('.agent-body', agents).first().removeClass('h');
          common.$g('i', agents).first().toggleClass('is-open');

          bean.on(agents, eventType, 'button', function() {
             var agent = this.parentNode;
             common.$g('.agent-body', agent).toggleClass('h');
             common.$g('i', agent).toggleClass('is-open');
          });
        },

        initExpandables: function() {
            var els = document.querySelectorAll('.expandable');

            for(var i = 0, l = els.length; i < l; i++) {
                var id = els[i].id;
                var e = new Expandable({id: id, expanded: false});
                e.init();
            }
        },

        initContinueReading: function() {
            common.$g('a.continue').each(function(el) {
                new ContinueReading(el).init();
            });
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
        modules.initAgents();
        modules.initExpandables();
        modules.initContinueReading();
        modules.loadMoreStories(storyId);
        modules.loadPageType(storyId, config);
    };

    return {
        init: init
    };
});

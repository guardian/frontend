define([
    "common",
    "bean",
    "ajax",

    "modules/accordion",
    "modules/gallery"
], function(
    common,
    bean,
    ajax,

    Accordion,
    Gallery
) {

    var modules = {
        initAccordion: function () {
            if(document.querySelector('.accordion')) {
                var a = new Accordion();
            }
        },

        initGallery: function () {
            if(document.getElementById('js-gallery-holder')) {
                var g = new Gallery().init();
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
        modules.initGallery();
        modules.initTimeline();
        modules.loadMoreStories();
    };

    return {
        init: init
    };
});

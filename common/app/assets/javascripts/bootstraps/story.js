define([
    "common",
    "bean",

    "modules/accordion",
    "modules/gallery"
], function(
    common,
    bean,

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
            var timeline = document.querySelector('.timeline');

            if(timeline) {
                common.$g('.event-articles').hide();
                bean.on(timeline, 'click', '.date-line', function(e) {
                    var block = common.$g(this).parent();

                    common.$g('.event-articles').hide();

                    if(common.$g('.event-articles', block).css('display') === "none") {
                        common.$g('.event-articles', block).show();
                    } else {
                        common.$g('.event-articles', block).hide();
                    }
                });
            }
        }
    };

    var init = function(req, config) {
        modules.initAccordion();
        modules.initGallery();
        modules.initTimeline();
    };

    return {
        init: init
    };
});

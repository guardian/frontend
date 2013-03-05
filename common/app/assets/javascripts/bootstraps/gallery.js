define([
    "common",

    "modules/gallery",
    "modules/analytics/gallery",
    "modules/accordion",
    "modules/experiment"
], function(
    common,
    Gallery,
    Tracking,
    Accordion,
    Experiment
) {

    var modules = {
        augmentGallery: function () {
            var g = new Gallery().init();
        },
        initOphanTracking:  function(config) {
            var gallerySize = config.page.gallerySize;
            if(gallerySize !== "") {
                var t = new Tracking({
                    id: config.page.id,
                    el : document.getElementById('js-gallery-holder'),
                    imageCount: parseInt(gallerySize, 10),
                    ophanUrl: config.page.ophanUrl
                });

                t.init();
            }
        },

        initExperiments: function(config) {
            common.mediator.on('modules:experiment:render', function() {
                if(document.querySelector('.accordion')) {
                    var a = new Accordion();
                }
            });
            var e = new Experiment();

            e.init(config);
        }
    };

    var init = function(req, config) {
        modules.augmentGallery();
        modules.initExperiments(config);
        modules.initOphanTracking(config);
    };

    return {
        init: init
    };
});
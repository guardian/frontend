define([
    "common",

    "modules/gallery",
    "modules/analytics/gallery",
    "modules/accordion",
    "modules/story/experiment"
], function(
    common,
    Gallery,
    Tracking,
    Accordion,
    Experiment
) {

    var modules = {
        augmentGallery: function () {
            common.mediator.on('page:gallery:ready', function(config, context) {
                var g = new Gallery(context).init();
            });
        },
        initOphanTracking:  function(config) {
            common.mediator.on('page:gallery:ready', function(config, context) {
                var gallerySize = config.page.gallerySize;
                if(gallerySize !== "") {
                    var t = new Tracking({
                        id: config.page.id,
                        el : context.querySelector('.js-gallery-holder'),
                        imageCount: parseInt(gallerySize, 10),
                        ophanUrl: config.page.ophanUrl
                    });

                    t.init();
                }
            });
        }
    };

    var ready = function (config, context) {
        common.lazyLoadCss('gallery', config);
        
        ready = function (config, context) {
            common.mediator.emit("page:gallery:ready", config, context);
        };
        // On first call to this fn only:
        modules.augmentGallery();
        modules.initOphanTracking();
        ready(config, context);
    };

    return {
        init: ready
    };

});
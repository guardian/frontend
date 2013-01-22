define([
    "modules/gallery",
    "modules/analytics/gallery"
], function(
    Gallery,
    Tracking
) {

    var modules = {
        augmentGallery: function () {
            var g = new Gallery().init();
        },
        initOphanTracking:  function(config) {
            var gallerySize = config.page.gallerySize;
            console.log(gallerySize);
            if(gallerySize !== "") {
                var t = new Tracking({
                    id: config.page.id,
                    el : document.getElementById('js-gallery-holder'),
                    imageCount: parseInt(gallerySize, 10)
                });

                t.init();
            }
        }
    };

    var init = function(req, config) {
        modules.augmentGallery();
        modules.initOphanTracking(config);
    };

    return {
        init: init
    };
});
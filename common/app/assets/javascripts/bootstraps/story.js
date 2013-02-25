define([
    "modules/accordion",
    "modules/gallery"
], function(
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
    };

    var init = function(req, config) {
        modules.initAccordion();
        modules.initGallery();
    };

    return {
        init: init
    };
});

define(["modules/gallery"], function(Gallery) {

    var modules = {
        augmentGallery: function () {
            var g = new Gallery().init();
        }
    };

    var init = function() {
        modules.augmentGallery();
    };

    return {
        init: init
    };
});
define(["modules/gallery"], function(Gallery) {

    var modules = {
        sexUpGallery: function () {
            var g = new Gallery().init();
        }
    };

    var init = function() {
        modules.sexUpGallery();
    };

    return {
        init: init
    };
});
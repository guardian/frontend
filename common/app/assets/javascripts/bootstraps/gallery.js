define([
    "common",
    "modules/lightbox-gallery"
], function(
    common,
    LightboxGallery
) {

    var modules = {
        augmentGallery: function () {
            common.mediator.on('page:gallery:ready', function(config, context) {
                var galleries = new LightboxGallery(config, context).init();
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            common.lazyLoadCss('gallery', config);
            modules.augmentGallery();
        }
        common.mediator.emit("page:gallery:ready", config, context);
    };

    return {
        init: ready
    };

});
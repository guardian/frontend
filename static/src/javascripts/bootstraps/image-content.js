define([
    'common/modules/gallery/lightbox'
], function (
    Lightbox
) {

    var ready = function () {
            Lightbox.init();
        };

    return {
        init: ready
    };

});

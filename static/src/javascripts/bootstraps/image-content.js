define([
    'common/modules/gallery/lightbox'
], function (
    Lightbox
) {

    var ready = function () {
            console.log('image content: ready');
            Lightbox.init();
        };

    return {
        init: ready
    };

});

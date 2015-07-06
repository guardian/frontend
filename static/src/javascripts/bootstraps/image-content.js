define([
    'common/modules/gallery/lightbox',
    'bootstraps/trail'
], function (
    Lightbox,
    trail
) {
    return {
        init: function () {
            trail();
            Lightbox.init();
        }
    };
});

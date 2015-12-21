define([
    'fastdom',
    'Promise',
    'common/modules/ui/sticky'
], function (fastdom, Promise, sticky) {
    function init(header) {
        return new Promise(function(resolve) {
            sticky.stick(document.querySelector('.facia-page > .gu-band, #article > .gu-band'));
            resolve();
        });
    }

    return {
        init: init
    };
});

define([
    'fastdom',
    'Promise',
    'common/modules/ui/sticky'
], function (fastdom, Promise, sticky) {
    function init() {
        return new Promise(function (resolve) {
            sticky.stick(document.querySelector('.facia-page > .paidfor-band, #article > .paidfor-band'));
            resolve();
        });
    }

    return {
        init: init
    };
});

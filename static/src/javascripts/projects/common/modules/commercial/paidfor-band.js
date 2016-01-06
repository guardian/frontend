define([
    'fastdom',
    'Promise',
    'common/modules/ui/sticky'
], function (fastdom, Promise, Sticky) {
    function init() {
        return new Promise(function (resolve) {
            var elem = document.querySelector('.facia-page > .paidfor-band, #article > .paidfor-band');
            if (elem) {
                new Sticky(elem).init();
            }
            resolve();
        });
    }

    return {
        init: init
    };
});

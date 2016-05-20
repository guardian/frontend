define([
    'fastdom',
    'Promise',
    'common/utils/config',
    'common/modules/ui/sticky'
], function (fastdom, Promise, config, Sticky) {
    function init() {
        if (config.page.hasSuperStickyBanner) {
            return;
        }

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

define([
    'Promise',
    'common/utils/config',
    'common/modules/ui/sticky',
    'common/modules/commercial/commercial-features'
], function (Promise, config, Sticky, commercialFeatures) {
    function init() {
        if (!commercialFeatures.paidforBand) {
            return Promise.resolve(false);
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

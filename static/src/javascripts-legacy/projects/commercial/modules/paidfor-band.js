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

        var elem = document.querySelector('.paidfor-band');
        if (elem) {
            new Sticky(elem).init();
        }

        return Promise.resolve();
    }

    return {
        init: init
    };
});

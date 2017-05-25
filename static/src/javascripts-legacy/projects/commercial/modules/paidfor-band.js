define([
    'lib/config',
    'common/modules/ui/sticky',
    'commercial/modules/commercial-features'
], function (config, Sticky, commercialFeatures) {
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

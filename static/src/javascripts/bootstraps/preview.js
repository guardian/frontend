define([
    'common/utils/config',
    'common/modules/preview/freshness-check',
    'common/utils/mediator'
], function (
    config,
    FreshnessCheck,
    mediator
) {

    var modules = {
        checkFreshness: function () {
            new FreshnessCheck().check();
        }
    },

    ready = function () {
        modules.checkFreshness();
        mediator.emit('page:common:preview:ready');
    };

    return {
        init: ready
    };

});

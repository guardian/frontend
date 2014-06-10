define([
    'common/utils/config'
], function(
    config
    ) {

    var effectiveMeasureUrl = 'js!' + (document.location.protocol === 'https:' ? 'https://au-ssl' : 'http://au-cdn') + '.effectivemeasure.net/em.js';

    function load() {
        if (config.switches.effectiveMeasure) {
            require([effectiveMeasureUrl], function () {});
        }
    }

    return {
        load: load
    };

});

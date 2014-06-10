define([
    'common/utils/config'
], function(
    config
    ) {

    var ammaUrl = 'js!//c.supert.ag/the-guardian/the-guardian/supertag-async.js';

    function load() {
        if (config.switches.amaa) {
            require([ammaUrl], function () {});
        }
    }

    return {
        load: load
    };

});

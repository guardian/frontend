define([
    'common/utils/config'
], function (
    config
) {

    var ammaUrl = '//c.supert.ag/the-guardian/the-guardian/supertag-async.js';

    function load() {
        if (config.switches.amaa) {
            return require(['js!' + ammaUrl + '!exports=superT']);
        }
    }

    return {
        load: load
    };

});

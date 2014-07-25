define([
    'common/utils/config'
], function(
    config
) {
    var outbrainUrl = '//widgets.outbrain.com/outbrain.js';

    function load() {
        if (config.switches.outbrain) {
            return require(['js!' + outbrainUrl + '!exports=outbrain']);
        }
    }

    return {
        load: load
    };

});

define([
    'common/utils/config'
], function(
    config
) {
    var outbrainUrl = (document.location.protocol) + '//widgets.outbrain.com/outbrain.js';

    function load() {
        if (config.switches.outbrain) {
            return require(['js!' + outbrainUrl + '!exports=outbrain']);
        }
    }

    return {
        load: load
    };

});

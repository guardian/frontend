define([
    'common/utils/config'
], function (config) {

    function load() {
        if (config.switches.audienceScienceGateway) {
            return require(['js!' + '//js.revsci.net/gateway/gw.js?csid=F09828&auto=t&bpid=theguardian']);
        }
    }

    return {
        load: load
    };

});

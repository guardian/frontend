define([
    'common/utils/config'
], function (config) {

    function load() {
        return require(['js!' + '//js.revsci.net/gateway/gw.js?csid=F09828&auto=t&bpid=theguardian']);
    }

    return {
        shouldRun: config.switches.audienceScienceGateway,
        load: load
    };

});

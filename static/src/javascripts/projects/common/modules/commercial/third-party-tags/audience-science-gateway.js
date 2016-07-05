define([
    'common/utils/config'
], function (config) {
    var audienceScienceGatewayUrl = '//js.revsci.net/gateway/gw.js?csid=F09828&auto=t&bpid=theguardian';

    function load() {
        return require(['js!' + audienceScienceGatewayUrl]);
    }

    return {
        shouldRun: config.switches.audienceScienceGateway,
        url: audienceScienceGatewayUrl,
        load: load
    };

});

define(['lib/config'], function(config) {
    var audienceScienceGatewayUrl =
        '//js.revsci.net/gateway/gw.js?csid=F09828&auto=t&bpid=theguardian';

    return {
        shouldRun:
            config.page.edition === 'UK' &&
                config.switches.audienceScienceGateway,
        url: audienceScienceGatewayUrl,
    };
});

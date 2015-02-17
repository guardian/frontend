define([
    'jquery',
    'underscore',
    'utils/fetch-config',
    'utils/fetch-switches'
], function (
    $,
    _,
    fetchConfig,
    fetchSwitches
) {
    var poller = _.once(function(callback, pollingMs) {
        setInterval(function(){
            fetchSettings(callback);
        }, pollingMs);
    });

    function fetchSettings(callback, pollingMs, terminateOnFail) {
        return $.when(fetchConfig(terminateOnFail), fetchSwitches(terminateOnFail))
        .done(function(config, switches) {
            callback(config, switches);
            if (pollingMs) {
                poller(callback, pollingMs);
            }
        });
    }

    return fetchSettings;
});

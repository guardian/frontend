/* global _: true */
define([
    'utils/fetch-config',
    'utils/fetch-switches'
], function(
    fetchConfig,
    fetchSwitches
) {
    var poller= _.once(function(callback, pollingMs) {
        setInterval(function(){
            fetchSettings(callback);
        }, pollingMs);
    });

    function fetchSettings(callback, pollingMs) {
        return $.when(fetchConfig(), fetchSwitches())
        .done(function(config, switches) {
            callback(config, switches);
            if (pollingMs) {
                poller(callback, pollingMs);
            }
        });
    }

    return fetchSettings;
});
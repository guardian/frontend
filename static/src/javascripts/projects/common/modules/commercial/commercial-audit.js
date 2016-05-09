define([
    'common/utils/config',
    'common/utils/report-error'
], function (config, reportError) {

    return {
        init: init
    };

    function init() {
        var guardian = window.guardian;
        var config = guardian.config;

        if (config.switches.commercialAudit) {
            window.addEventListener('message', receiveMessage, false);
        }

    }

    function receiveMessage(event) {
        var origin = event.origin || event.originalEvent.origin;
        var message = event.data;


        if (message.startsWith('Tracker beacon: ')) {
            reportError(new Error('###Ad Beacon'), {
                feature: 'commercial',
                message: message,
                source: origin
            }, false);
            console.log("message received " + message);
        }
        return;
    }
});

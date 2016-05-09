define([
    'common/utils/config',
    'common/utils/report-error'
], function (config, reportError) {

    return {
        init: init
    };

    function init() {
        if (config.switches.commercialAudit) {
            window.addEventListener('message', receiveMessage, false);
        }

    }

    function receiveMessage(event) {
        var origin = event.origin || event.originalEvent.origin;
        var message = event.data;


        if (message.indexOf('Tracker beacon: ') === 0) {
            reportError(new Error('Ad Beacon fired'), {
                feature: 'commercial',
                message: message,
                source: origin
            }, false);
        }
        return;
    }
});

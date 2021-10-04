@()(implicit context: model.ApplicationContext)

@import play.api.Mode.Dev

import { isAdBlockInUse } from '@guardian/commercial-core'; // doesn't work :/

try {
    isAdBlockInUse().then((blockerDetected) => {
        var adBlockers = window.guardian.adBlockers;

        adBlockers.active = blockerDetected

        // Run each listener
        runEachListener(adBlockers.onDetect);

        // Run subsequent listeners immediately
        adBlockers.onDetect = {
            push : function () {
                var toRun = Array.prototype.slice.call(arguments, 0);
                runEachListener(toRun);
            }
        };

        function runEachListener(listeners) {
            for (var i = 0; i < listeners.length; i++) {
                try {
                    listeners[i](adBlockers.active);
                } catch (e) {}
            }
        }
    })
} catch (e) {
    @if(context.environment.mode == Dev) {throw (e)}
}

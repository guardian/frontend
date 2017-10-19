@()(implicit context: model.ApplicationContext)

@import play.api.Mode.Dev

try {
    (function(document, window) {
        if (typeof window.getComputedStyle !== 'function') {
            // Old browsers not supporting getComputedStyle most likely won't have adBlockers
            return;
        }

        var ad = document.createElement('div');

        ad.style.position = 'absolute';
        ad.style.left = '0';
        ad.style.top = '0';
        ad.style.height = '10px';
        ad.style.zIndex = '-1';
        ad.innerHTML = '&nbsp;';
        ad.setAttribute('class', 'ad_unit');

        // avoid a forced sync layout, and open door to more accurate detection
        // e.g. detecting network behaviour
        window.requestAnimationFrame(function() {
            document.body.appendChild(ad);

            // avoid a forced layout, and be sure the element has been added to the DOM
            window.requestAnimationFrame(function() {
                var adBlockers = window.guardian.adBlockers;
                var adStyles = window.getComputedStyle(ad);

                // Due to an update to AdblockPlus we now need an extra check for adblock being used on Firefox as the sacrificial ad check does not work.
                var displayProp = adStyles && adStyles.getPropertyValue('display');
                var mozBindingProp = adStyles && adStyles.getPropertyValue('-moz-binding');

                adBlockers.active = displayProp === 'none' || (mozBindingProp && mozBindingProp.indexOf('about:') !== -1);

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
            });
        });
    })(document, window);
} catch (e) {
    @if(context.environment.mode == Dev) {throw (e)}
}

define([
    'lib/fastdom-promise',
    'lodash/utilities/template',
    'lib/detect',
    'commercial/modules/creatives/add-tracking-pixel',
    'commercial/modules/creatives/add-viewability-tracker',
    'raw-loader!commercial/views/creatives/revealer.html'
], function(fastdom, template, detect, addTrackingPixel, addViewabilityTracker, revealerStr) {
    var revealerTpl;

    function Revealer(adSlot, params) {
        revealerTpl || (revealerTpl = template(revealerStr));

        params.id = 'revealer-' + (Math.random() * 10000 | 0).toString(16);

        return Object.freeze({
            create: create
        });

        function create() {
            var markup = revealerTpl(params);

            return fastdom.write(function () {
                adSlot.insertAdjacentHTML('beforeend', markup);
                // #? `classList.add` takes multiple arguments, but we are using it
                // here with arity 1 because polyfill.io has incorrect support with IE 10 and 11.
                // One may revert to adSlot.classList.add('ad-slot--revealer', 'ad-slot--fabric', 'content__mobile-full-width');
                // When support is correct or when we stop supporting IE <= 11
                adSlot.classList.add('ad-slot--revealer');
                adSlot.classList.add('ad-slot--fabric');
                adSlot.classList.add('content__mobile-full-width');
                if (params.trackingPixel) {
                    addTrackingPixel.addTrackingPixel(params.trackingPixel + params.cacheBuster);
                }
                if (params.researchPixel) {
                    addTrackingPixel.addTrackingPixel(params.researchPixel + params.cacheBuster);
                }
                if (params.viewabilityTracker) {
                    addViewabilityTracker(adSlot, params.id, params.viewabilityTracker);
                }
            }).then(function () {
                return fastdom.read(function () {
                    return detect.getViewport();
                });
            }).then(function (viewport) {
                return fastdom.write(function () {
                    var background = adSlot.getElementsByClassName('creative__background')[0];
                    // for the height, we need to account for the height of the location bar, which
                    // may or may not be there. 70px padding is not too much.
                    background.style.height = (viewport.height + 70) + 'px';
                    return true;
                });
            });
        }
    }

    return Revealer;
});

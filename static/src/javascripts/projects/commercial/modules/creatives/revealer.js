define([
    'common/utils/fastdom-promise',
    'common/utils/template',
    'common/utils/detect',
    'commercial/modules/creatives/add-tracking-pixel',
    'text!commercial/views/creatives/revealer.html'
], function(fastdom, template, detect, addTrackingPixel, revealerStr) {
    var revealerTpl;

    function Revealer($adSlot, params) {
        revealerTpl || (revealerTpl = template(revealerStr));

        return Object.freeze({
            create: create
        });

        function create() {
            var markup = revealerTpl(params);

            return fastdom.write(function () {
                $adSlot[0].insertAdjacentHTML('beforeend', markup);
                $adSlot.addClass('ad-slot--revealer ad-slot--fabric content__mobile-full-width');
                if (params.trackingPixel) {
                    addTrackingPixel($adSlot, params.trackingPixel + params.cacheBuster);
                }
            }).then(function () {
                return fastdom.read(function () {
                    return detect.getViewport();
                });
            }).then(function (viewport) {
                return fastdom.write(function () {
                    var background = $adSlot[0].getElementsByClassName('creative__background')[0];
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

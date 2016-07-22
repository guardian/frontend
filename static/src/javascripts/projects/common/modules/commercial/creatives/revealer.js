define([
    'common/utils/fastdom-promise',
    'common/utils/template',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/revealer.html'
], function(fastdom, template, addTrackingPixel, revealerStr) {
    var hasBackgroundFixedSupport = !detect.isAndroid();
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
                $adSlot.addClass('ad-slot--revealer');
                if (params.trackingPixel) {
                    addTrackingPixel($adSlot, params.trackingPixel + params.cacheBuster);
                }
            });
        }
    }

    return Revealer;
});

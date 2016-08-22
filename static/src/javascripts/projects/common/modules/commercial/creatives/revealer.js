define([
    'common/utils/fastdom-promise',
    'common/utils/template',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'text!common/views/commercial/creatives/revealer.html'
], function(fastdom, template, addTrackingPixel, revealerStr) {
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
            }).then(function () {
                return fastdom.read(function () {
                    return $adSlot[0].getBoundingClientRect();
                });
            }).then(function (adSlotRect) {
                var background = $adSlot[0].getElementsByClassName('creative__background')[0];
                background.style.left = (adSlotRect.left + adSlotRect.width / 2) + 'px';
                return true;
            });
        }
    }

    return Revealer;
});

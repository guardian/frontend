define([
    'common/utils/closest',
    'common/utils/fastdom-promise',
    'commercial/modules/messenger'
], function (closest, fastdom, messenger) {
    messenger.register('type', function(specs, ret, iframe) {
        return setType(specs, closest(iframe, '.js-ad-slot'));
    });

    return setType;

    function setType(type, adSlot) {
        return fastdom.write(function () {
            adSlot.classList.add('ad-slot--' + type);
        });
    }
});

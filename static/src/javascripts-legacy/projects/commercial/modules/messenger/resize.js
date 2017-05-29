define([
    'lodash/objects/assign',
    'lib/fastdom-promise',
    'commercial/modules/messenger'
], function (assign, fastdom, messenger) {
    messenger.register('resize', function(specs, ret, iframe) {
        var adSlot = iframe && iframe.closest('.js-ad-slot');
        return resize(specs, iframe, adSlot);
    });

    function resize(specs, iframe, adSlot) {
        if (!specs || !('height' in specs || 'width' in specs) || !iframe || !adSlot) {
            return null;
        }

        var styles = {};

        if (specs.width) {
            styles.width = normalise(specs.width);
        }

        if (specs.height) {
            styles.height = normalise(specs.height);
        }

        return fastdom.write(function () {
            assign(adSlot.style, styles);
            assign(iframe.style, styles);
        });
    }

    function normalise(length) {
        var lengthRegexp = /^(\d+)(%|px|em|ex|ch|rem|vh|vw|vmin|vmax)?/;
        var defaultUnit = 'px';
        var matches = String(length).match(lengthRegexp);
        if (!matches) {
            return null;
        }
        return matches[1] + (matches[2] === undefined ? defaultUnit : matches[2]);
    }

    return resize;
});

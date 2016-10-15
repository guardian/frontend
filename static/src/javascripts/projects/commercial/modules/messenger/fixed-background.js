define([
    'common/utils/assign',
    'common/utils/closest',
    'common/utils/fastdom-promise',
    'commercial/modules/messenger'
], function (assign, closest, fastdom, messenger) {
    messenger.register('fixed-background', function(specs, ret, iframe) {
        return setBackground(specs, closest(iframe, '.js-ad-slot'));
    });

    return setBackground;

    function setBackground(specs, adSlot) {
        if (!specs || !('backgroundImage' in specs) || !('backgroundRepeat' in specs)) {
            return null;
        }

        var background = document.createElement('div');
        background.className = 'creative__background';
        assign(background.style, specs);

        var backgroundParent = document.createElement('div');
        backgroundParent.className = 'creative__background-parent';
        if( 'backgroundColour' in specs) {
            backgroundParent.style.backgroundColor = specs.backgroundColour;
        }
        backgroundParent.appendChild(background);

        return fastdom.write(function () {
            adSlot.insertBefore(backgroundParent, adSlot.firstChild);
        });
    }
});

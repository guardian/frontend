define([
    'common/utils/closest',
    'common/utils/fastdom-promise',
    'commercial/modules/messenger'
], function (closest, fastdom, messenger) {
    messenger.register('parallax-background', function(specs, ret, iframe) {
        return setBackground(specs, closest(iframe, '.js-ad-slot'));
    });

    return setBackground;

    function setBackground(specs, adSlot) {
        if (!specs || !('backgroundImage' in specs) || !('backgroundRepeat' in specs)) {
            return null;
        }

        var updateQueued = false;

        var background = document.createElement('canvas');
        background.className = 'creative__canvas';
        background.height = 500;
        var ctx = background.getContext('2d');

        var image = new Image();
        image.src = specs.backgroundImage;
        image.onload = function () {
            window.addEventListener('scroll', function () {
                if (!updateQueued) {
                    updateQueued = true;
                    fastdom.read(updateBackgroundPosition);
                }
            });
        }

        var backgroundParent = document.createElement('div');
        backgroundParent.className = 'creative__background-parent';
        if( 'backgroundColour' in specs) {
            backgroundParent.style.backgroundColor = specs.backgroundColour;
        }
        backgroundParent.appendChild(background);

        return fastdom.write(function () {
            adSlot.insertBefore(backgroundParent, adSlot.firstChild);
        })
        .then(function () {
            return fastdom.read(function () {
                return background.getBoundingClientRect();
            });
        })
        .then(function (rect) {
            return fastdom.write(function () {
                background.width = rect.width;
            });
        })
        .then(function (rect) {
            return fastdom.read(function () {
                updateBackgroundPosition();
            });
        });

        function updateBackgroundPosition() {
            updateQueued = false;
            var rect = backgroundParent.getBoundingClientRect();
            ctx.drawImage(image, 0, -0.3 * rect.top);
        }
    }
});

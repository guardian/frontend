define([
    'common/utils/assign',
    'common/utils/closest',
    'common/utils/fastdom-promise',
    'commercial/modules/messenger'
], function (assign, closest, fastdom, messenger) {
    messenger.register('background', function(specs, ret, iframe) {
        return setBackground(specs, closest(iframe, '.js-ad-slot'));
    });

    return setBackground;

    function setBackground(specs, adSlot) {
        if (!specs ||
            !('backgroundImage' in specs) ||
            !('backgroundRepeat' in specs) ||
            !('backgroundPosition' in specs) ||
            !('scrollType' in specs)
        ) {
            return null;
        }

        // Create an element to hold the background image
        var background = document.createElement('div');
        background.className = 'creative__background creative__background--' + specs.scrollType;
        assign(background.style, specs);

        // Wrap the background image in a DIV for positioning. Also, we give
        // this DIV a background colour if it is provided. This is because
        // if we set the background colour in the creative itself, the background
        // image won't be visible (think z-indexed layers)
        var backgroundParent = document.createElement('div');
        backgroundParent.className = 'creative__background-parent';
        if ('backgroundColour' in specs) {
            backgroundParent.style.backgroundColor = specs.backgroundColour;
        }
        backgroundParent.appendChild(background);

        if( specs.scrollType === 'fixed' ) {
            return fastdom.write(function () {
                adSlot.insertBefore(backgroundParent, adSlot.firstChild);
            });
        } else {
            var updateQueued = false;

            // We keep track of the scroll offset to compute the parallax effect
            var scrollY;

            // The top above slot is fixed and thus requires a special transform formula
            var getDy = adSlot.classList.contains('ad-slot--top-above-nav') ?
                getDyTopAbove :
                getDyOthers;

            // Set the vertical background position to a reasonable default value
            background.style.backgroundPositionY = '0%';

            return fastdom.write(function () {
                adSlot.insertBefore(backgroundParent, adSlot.firstChild);
            })
            .then(function () {
                window.addEventListener('scroll', function () {
                    scrollY = window.pageYOffset;
                    if (!updateQueued) {
                        updateQueued = true;
                        fastdom.read(function () {
                            updateQueued = false;
                            var rect = backgroundParent.getBoundingClientRect();
                            return getDy(scrollY, rect);
                        })
                        .then(function (dy) {
                            fastdom.write(function () {
                                background.style.backgroundPositionY = dy + '%';
                            });
                        });
                    }
                });
            });
        }
    }
});

function getDyTopAbove(scrollY, rect) {
    return -0.3 * (scrollY - rect.top);
}

function getDyOthers(scrollY, rect) {
    return -0.3 * rect.top;
}

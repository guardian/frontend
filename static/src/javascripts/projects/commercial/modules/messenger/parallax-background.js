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
            !('maxHeight' in specs)
        ) {
            return null;
        }

        var updateQueued = false;

        // This is the x-axis offset where we put the top left corner of
        // the background image in the canvas. It depends on the value of
        // backgroundPosition and the size of the image.
        var dx;

        // We keep track of the scroll offset to compute the parallax effect
        var scrollY;
        var getDy = adSlot.classList.contains('ad-slot--top-above-nav') ?
            getDyTopAbove :
            getDyOthers;

        // Create a canvas element which needs to be as high as the largest
        // height the creative will ever be (which is why this value is
        // provided by the creative)
        var background = document.createElement('canvas');
        background.className = 'creative__canvas';
        background.height = specs.maxHeight;
        var ctx = background.getContext('2d');

        // Load the background image and kick-off the parallax effect
        // as soon as the image is loaded
        var image = new Image();
        image.src = specs.backgroundImage;
        image.onload = function () {
            window.addEventListener('scroll', function () {
                scrollY = window.pageYOffset;
                if (!updateQueued) {
                    updateQueued = true;
                    fastdom.read(updateBackgroundPosition);
                }
            });
        };

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

        // We insert the background parent in the DOM and then two things must happen:
        // 1. we give a width to the CANVAS element, equal to its computed width. This
        //    is required otherwise some browsers will think width=300
        // 2. we give the background its correct initial position depending on the
        //    scroll position. Note: we do this in a DOM read because writing in a
        //    CANVAS element is not a DOM operation :-)
        return fastdom.write(function () {
            adSlot.insertBefore(backgroundParent, adSlot.firstChild);
        })
        .then(function () {
            return fastdom.read(function () {
                scrollY = window.pageYOffset;
                return background.getBoundingClientRect();
            });
        })
        .then(function (rect) {
            return fastdom.write(function () {
                background.width = rect.width;
            });
        })
        .then(function () {
            if( !updateQueued ) {
                updateQueued = true;
                return fastdom.read(updateBackgroundPosition);
            }
        });

        function updateBackgroundPosition() {
            updateQueued = false;
            var rect = backgroundParent.getBoundingClientRect();
            if( dx === undefined ) {
                dx = getDx(specs, background, image);
            }
            var dy = getDy(scrollY, rect);
            if( image.height < specs.maxHeight ) {
                ctx.drawImage(image, dx, dy);
            } else {
                ctx.drawImage(image, dx, dy);
            }
        }
    }
});

function getDx(specs, background, image) {
    switch( specs.backgroundPosition ) {
    case 'top left':
    case 'center left':
    case 'bottom left':
        return 0;

    case 'top center':
    case 'center center':
    case 'bottom center':
        return (background.width - image.width) / 2;

    case 'top right':
    case 'center right':
    case 'bottom right':
        return background.width - image.width;
    }
}

function getDyTopAbove(scrollY, rect) {
    return -0.3 * (scrollY - rect.top);
}

function getDyOthers(scrollY, rect) {
    return -0.3 * rect.top;
}

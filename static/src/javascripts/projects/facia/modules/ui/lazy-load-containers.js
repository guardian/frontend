import fastdom from 'fastdom';
import qwery from 'qwery';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import throttle from 'lodash/functions/throttle';
var distanceBeforeLoad = detect.getViewport().height;

export default function() {
    var containers = qwery('.js-container--lazy-load'),
        lazyLoad = throttle(function() {
            if (containers.length === 0) {
                mediator.off('window:throttledScroll', lazyLoad);
            } else {
                fastdom.read(function() {
                    var containersInRange = containers.reduce(function(result, container) {
                        result[withinRange(container) ? 'in' : 'out'].push(container);
                        return result;
                    }, { in : [], out: []
                    });

                    containers = containersInRange.out;

                    fastdom.write(function() {
                        containersInRange.in.forEach(displayContainer);
                    });
                });
            }
        }, 500);

    mediator.on('window:throttledScroll', lazyLoad);
    lazyLoad();
};

// withinRange(Element) : Bool
// Checks whether the element is within one screenful above or below the viewport
function withinRange(container) {
    var top = container.nextElementSibling.getBoundingClientRect().top;
    return -distanceBeforeLoad < top && top < 2 * distanceBeforeLoad;
}

// displayContainer(Element) : Void
// Removes the fc-container--lazy-load class
function displayContainer(container) {
    container.classList.remove('fc-container--lazy-load');
}

define([
    'Promise',
    'common/modules/accessibility/main',
    'common/utils/$',
    'common/utils/mediator',
    'bonzo',
    'facia/modules/ui/slideshow/state',
    'facia/modules/ui/slideshow/dom'
], function (
    Promise,
    accessibility,
    $,
    mediator,
    bonzo,
    state,
    dom
) {
    var states = [];

    function waitForLazyLoad(listOfImages) {
        return new Promise(function (resolve) {
            if (listOfImages[0].loaded) {
                resolve(listOfImages);
            } else {
                mediator.on('ui:images:lazyLoaded', function (image) {
                    if (dom.equal(image, listOfImages[0])) {
                        resolve(listOfImages);
                        return true;
                    }
                });
            }
        });
    }

    function startSlideshow(listOfImages) {
        if (listOfImages.length > 1) {
            var stateMachine = state.init(listOfImages);
            states.push(stateMachine);
            stateMachine.goTo(1).then(function () {
                stateMachine.start();
            });
        }
    }

    function actualInit() {
        if (!accessibility.isOn('flashing-elements')) {
            return;
        }

        $('.js-slideshow').each(function (container) {
            return dom.init(container)
                .then(waitForLazyLoad).then(startSlideshow);
        });
    }

    function init() {
        // This is called on page load, do as little as possible
        setTimeout(actualInit, state.interval);
    }

    function destroy() {
        for (var i = 0, len = states.length; i < len; i += 1) {
            states[i].stop();
        }
    }

    return {
        init: init,
        destroy: destroy
    };
});

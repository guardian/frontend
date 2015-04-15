define([
    'Promise',
    'common/utils/$',
    'bonzo',
    'facia/modules/ui/slideshow/state',
    'facia/modules/ui/slideshow/dom'
], function (
    Promise,
    $,
    bonzo,
    state,
    dom
) {
    var states = [];

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
        $('.js-slideshow').each(function (container) {
            return dom.init(container).then(startSlideshow);
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

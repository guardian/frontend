define([
    'bean',
    'common/utils/$',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bean,
    $,
    _,
    detect,
    mediator
    ) {

    var socialPos,
        vPosNow = window.scrollY,
        vPosCache,
        winHeight,
        socialsContainer;

    //function getWindowHeight() {
    //    return window.innerHeight || document.documentElement.clientHeight;
    //}

    function getPosition() {
        socialPos = socialsContainer[0].getBoundingClientRect().top;
    }

    function setPosition() {
        var winBottom;

        vPosNow = window.scrollY;

        if (vPosCache !== vPosNow) {
            vPosCache = vPosNow;
            winBottom = winHeight + vPosNow;

            if (vPosNow < socialPos) {
                socialsContainer.removeClass('meta__social--sticky');
            } else {
                socialsContainer.addClass('meta__social--sticky');
            }
        }
    }

    function init() {
        var breakpoint = detect.getBreakpoint(true);

        if (true || breakpoint === 'mobile') {
            socialsContainer = $('.meta__social');

            getPosition();
            setPosition();
            mediator.on('window:scroll', _.throttle(setPosition, 10));
        }
    }

    return {
        init: init
    };
});

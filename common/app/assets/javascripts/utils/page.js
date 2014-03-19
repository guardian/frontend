define(['common/$'],
function($) {

    function rightHandComponentVisible(yes, no) {
        var el = $('.js-right-hand-component')[0],
            vis = el.offsetWidth > 0 && el.offsetHeight > 0;

        if (vis) {
            return yes ? yes(el) : el;
        } else {
            return no ? no() : null;
        }
    }

    return {
        rightHandComponentVisible: rightHandComponentVisible
    };

}); // define
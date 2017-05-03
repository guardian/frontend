define([
    'qwery'
], function (
    qwery
) {

    function hasParent(selector, context) {
        while (!context[0].classList.contains(selector)) {
            if (context[0].tagName === 'HTML') {
                return false;
            } else {
                context = qwery(context[0].parentElement);
            }
        }

        return true;
    }

    return hasParent;

}); // define

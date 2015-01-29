define([
    'bonzo',
    'qwery',
    'common/utils/_'
], function (
    bonzo,
    qwery,
    _
) {

    function findParent(selector, context) {
        context = qwery(context.target);

        while (makeArray(context[0].classList).indexOf(selector) == -1) {
            if (context[0].tagName === "HTML") {
                 console.log("No Match found");
                return false;
            } else {
                context = qwery(context[0].parentElement);
            }
        }

        console.log("Match Parent");
        return true;
    }

    function makeArray(obj) {
        return Object.keys(obj).map(function (key) {return obj[key]});
    }

    return findParent;

}); // define

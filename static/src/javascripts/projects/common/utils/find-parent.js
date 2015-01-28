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
        while ((context = context.parentElement) && !context.classList.contains(selector));
        console.log(context);
        return context;
    }
    return findParent;

}); // define

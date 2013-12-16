define([
    'bonzo',
    'qwery'
], function(
    bonzo,
    qwery
) {

function $(selector, context) {
    return bonzo(qwery(selector, context));
}
return $;

}); // define

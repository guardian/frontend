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
$.create = function(s) {
    return bonzo(bonzo.create(s));
};
return $;

}); // define

define([
    'bonzo',
    'qwery'
], function(
    bonzo,
    qwery
) {

var staticMethod;
function $(selector, context) {
    return bonzo(qwery(selector, context));
}
for (staticMethod in bonzo) {
    if(bonzo.hasOwnProperty(staticMethod)) {
        $[staticMethod] = bonzo[staticMethod];
    }
}
return $;

}); // define

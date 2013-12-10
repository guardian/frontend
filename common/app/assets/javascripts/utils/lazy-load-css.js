/*global guardian:false*/
define([
    'bonzo'
], function(
    bonzo
) {

function lazyLoadCss(name) {
    // append server specific css
    bonzo(document.createElement('link'))
        .attr('rel', 'stylesheet')
        .attr('type', 'text/css')
        .attr('href', guardian.css[name])
        .appendTo(document.querySelector('body'));
}
return lazyLoadCss;

}); // define

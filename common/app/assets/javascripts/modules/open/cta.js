define([
    'modules/component'
], function(
    Component
) {

/** @constructor */
var Cta = function() {

};
Component.define(Cta);

/** @type {Object.<string.*>} */
Cta.CONFIG = {
    endpoint: '/open/cta.json'
};

/** @type {Object.<string.*>} */
Cta.prototype.defaultOptions = {};

/** @override */
Cta.prototype.ready = function() {};


return Cta;

});
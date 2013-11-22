define([
    'modules/component'
], function(
    Component
) {

/** @constructor */
var Cta = function(context, mediator, options) {
    this.contex = context;
    this.mediator = mediator;
    this.setOptions(options);
};
Component.define(Cta);

/** @type {Object.<string.*>} */
Cta.CONFIG = {
    endpoint: '/open/cta/article/:discussionKey.json'
};

/** @type {Object.<string.*>} */
Cta.prototype.defaultOptions = {
    discussionKey: null
};

/** @override */
Cta.prototype.ready = function() {};


return Cta;

});
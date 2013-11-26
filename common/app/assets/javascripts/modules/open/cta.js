define([
    '$',
    'modules/component'
], function(
    $,
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
Cta.prototype.prerender = function() {
    var comments = $('.comment', this.elem),
        comment = comments[Math.floor(Math.random() * comments.length) + 0];

    if (comments.length === 0) {
        this.destroy();
    } else {
        this.elem = comment;
    }
};

/** @override */
Cta.prototype.ready = function() {};


return Cta;

});
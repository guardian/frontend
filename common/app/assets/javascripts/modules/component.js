define(['bean'], function(bean) {

/**
 * TODO:
 * * Remove bean dependency (make it an arg (DI?))
 * @constructor
 */
var Component = function() {};

/**
 * @type {Object|string|null}
 */
Component.prototype.template = null;

/**
 * @type {Object.<string, *>}
 */
Component.prototype.attr = {};

/**
 * This need to be called from the child component
 * @param {Object=} opts (optional)
 */
Component.prototype.init = function(opts) {};

/**
 * @param {Element} elem
 * @private
 */
Component.prototype.decorate = function(elem) {
    this.element = elem;

    this.ready();
};

/**
 * Renders the element onto the page
 * There are three sources of the element
 * 1. The element provided. This will maintain data values.
 * 2. An already existing element on the page,
 *    retrieved from ```this.selector```.
 *    This will not maintain data values. e.g.
 *    * ```<script type="template" id="template"></script>```
 *    * ```<div class="template">...</div>```
 * 3. An XHR request to the server.
 *
 * @param {Element=} elem
 */
Component.prototype.render = function(elem) {
    // 1.
    if (elem) {
        this.setup(elem, true);
        this.ready();
    }

    // TODO (james): 2.

    // TODO (james): 3.
};

/**
 * This will take the DOM object and make it into a data array
 * A.K.A: data-binding (will look at Ractive)
 * @param {Element} template
 * @param {Boolean=} retainData (optional).
 */
Component.prototype.setup = function(elem, retainData) {
    this.elem = elem;
};

/**
 * Once the render / decorate methods have been called
 * This is where you could do your event binding
 * This function is made to be overridden
 */
Component.prototype.ready = function() {

};

/**
 * Once we're done with it, remove event bindings etc
 */
Component.prototype.dispose = function() {

};

/**
 * TODO: Error on argument checks
 * @param {string} eventName
 */
Component.prototype.on = function() {
    var selector, eventName, handler,
        params = Array.prototype.slice.call(arguments);

    if (arguments.length === 3) {
        selector = arguments[0];
        arguments.shift();
    }

    eventName = arguments[0];
    handler = arguments[1];

    bean.on(this.elem, eventName, selector, handler);
};


Component.create = function(child) {
    function Tmp() {}
    Tmp.prototype = Component.prototype;
    child.prototype = new Tmp();
    child.prototype.constructor = child;
};

return Component;

});
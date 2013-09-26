define(['bean', 'qwery'], function(bean, qwery) {

/**
 * TODO:
 * * ERROR HANDLING!
 * * Remove bean dependency (make it an arg (DI?))
 * * Find a way to run the Component constructor manually,
 *   Perhaps in the create method somewhere.
 * @constructor
 */
var Component = function() {};

/**
 * This object is an interface and meant to be overridden
 * mostly used for absttracting CSS classes.
 * This makes for easy testing, less duplication of string variables,
 * and hopefully, one day, in string compilation
 * @type {Object.<string.*>}
 */
Component.CONFIG = {
    // These are CSS classes for DOM elements in this component
    classes: { component: 'component' }
};

/** @type {Element|null} */
Component.prototype.context = null;

/** @type {Element|null} */
Component.prototype.elem = null;

/** @type {Object|string|null} */
Component.prototype.template = null;

/**
 * Uses the CONFIG.classes.component
 * TODO (jamesgorrie): accept elements, strings etc
 */
Component.prototype.attachTo = function() {
    var selector = this.getClass('component'),
        elem = qwery(selector, this.context);

    if (elem.length === 0) { throw new ComponentError('No element of type "'+ selector +'" to attach to.'); }
    this.elem = elem[0];
    this.ready();
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

    selector = selector || handler; // Hack around dynamic arguments
    bean.on(this.elem, eventName, selector, handler);
};

/**
 * @param {string} eventName
 * @param {Object=} args (optional)
 */
Component.prototype.emit = function(eventName, args) {
    bean.fire(this.elem, eventName);
};

/**
 * @param {string} eventName
 * @param {boolean} sansDot
 * @return {string}
 */
Component.prototype.getClass = function(elemName, sansDot) {
    var config = this.constructor.CONFIG;
    return (sansDot ? '' : '.') + config.classes[elemName] || null;
};


/**
 * @param {Function} child
 */
Component.create = function(child) {
    function Tmp() {}
    Tmp.prototype = Component.prototype;
    child.prototype = new Tmp();
    child.prototype.constructor = child;
};

/** @contructor */
function ComponentError(message) {
    return new Error('Component: '+ message);
}

return Component;

});
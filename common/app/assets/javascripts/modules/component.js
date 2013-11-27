define([
    'bean',
    'qwery',
    'bonzo',
    'utils/ajax'
], function(
    bean,
    qwery,
    bonzo,
    ajax
    ) {

    /**
     * TODO (jamesgorrie):
     * * ERROR HANDLING!
     * * Find a way to run the Component constructor manually,
     *   Perhaps in the create method somewhere.
     * @constructor
     */
    var Component = function() {};

    /** @type {boolean} */
    Component.prototype.useBem = false;

    /** @type {string} */
    Component.prototype.templateName = null;

    /** @type {string} */
    Component.prototype.componentClass = null;

    /** @type {string} */
    Component.prototype.endpoint = null;

    /** @type {Object.<string.string>} */
    Component.prototype.classes = null;

    /** @type {Element|null} */
    Component.prototype.context = null;

    /** @type {Element|null} */
    Component.prototype.elem = null;

    /** @type {Object|string|null} */
    Component.prototype.model = null;

    /** @type {Object|string|null} */
    Component.prototype.template = null;

    /** @type {boolean} */
    Component.prototype.rendered = false;

    /** @type {boolean} */
    Component.prototype.destroyed = false;

    /** @type {Object.<string.Element>} */
    Component.prototype.elems = null;

    /** @type {Object.<string.*>} */
    Component.prototype.options = null;

    /** @type {Object.<string.*>} */
    Component.prototype.defaultOptions = {};

    /**
     * Uses the this.componentClass
     * TODO (jamesgorrie): accept strings etc Also what to do with multiple objects?
     * @param {Element|string=} elem (optional)
     */
    Component.prototype.attachTo = function(elem) {
        this.checkAttached();
        if (!elem) {
            throw new ComponentError('Need element to attach to');
        } else {
            this.elem = elem;
            this._prerender();
            this._ready();
        }
    };

    /**
     * Uses the CONFIG.componentName
     */
    Component.prototype.attachToDefault = function() {
        this.checkAttached();
        var elem = qwery('.'+ this.componentClass, this.context);
        if (elem.length === 0) {
            throw new ComponentError('No element of type "'+ '.'+ this.componentName +'" to attach to.');
        }
        this.elem = elem[0];
        this._prerender();
        this._ready();
    };

    /**
     * @param {Element=} parent (optional)
     */
    Component.prototype.render = function(parent) {
        this.checkAttached();
        var template = bonzo.create(document.getElementById('tmpl-'+ this.templateName).innerHTML)[0],
            container = parent || document.body;

        this.elem = template;
        this._prerender();
        bonzo(container).append(this.elem);
        this._ready();
    };

    /**
     * @param {Element} parent
     */
    Component.prototype.fetch = function(parent) {
        this.checkAttached();
        var self = this,
            endpoint = this.endpoint,
            opt;

        for (opt in this.options) {
            endpoint = endpoint.replace(':'+ opt, this.options[opt]);
        }

        return ajax({
            url: endpoint,
            type: 'json',
            method: 'get',
            crossOrigin: true
        }).then(
            function render(resp) {
                self.elem = bonzo.create(resp.html)[0];
                self._prerender();

                if (!self.destroyed) {
                    bonzo(parent).append(self.elem);
                    self._ready();
                }
            }
        );
    };

    /**
     * Throws an error if this is already attached to the DOM
     */
    Component.prototype.checkAttached = function() {
        if (this.rendered) {
            throw new ComponentError('Already rendered');
        }
    };

    /**
     * This is just used to set up the component internally
     */
    Component.prototype._ready = function() {
        if (!this.destroyed) {
            this.rendered = true;
            this.ready();
        }
    };

    /**
     * Used as we need for pre-prerendering
     */
    Component.prototype._prerender = function() {
        this.elems = {};
        this.prerender();
    };

    /**
     * This is user to edit this.elem before it's rendered
     * This will help with the rendering performance that
     * we would lose if rendered then manipulated
     */
    Component.prototype.prerender = function() {};

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your event binding
     * This function is made to be overridden
     */
    Component.prototype.ready = function() {};

    /**
     * Once we're done with it, remove event bindings etc
     */
    Component.prototype.dispose = function() {};

    /**
     * @param {string} eventName
     * @param {Element|Function} elem if ommited which is also handler
     * @param {Function} handler
     */
    Component.prototype.on = function(eventName, elem, handler) {
        if (typeof elem === 'function') {
            handler = elem;
            bean.on(this.elem, eventName, handler.bind(this));
        } else {
            elem = !elem.length ? [elem] : elem;
            bean.on(this.elem, eventName, elem, handler.bind(this));
        }
    };

    /**
     * @param {string} eventName
     * @param {Object=} args (optional)
     */
    Component.prototype.emit = function(eventName, args) {
        bean.fire(this.elem, eventName, args);
    };

    /**
     * TODO: After working on comments, wondering if this should support NodeLists
     * @param {string} elemName this corresponds to this.classes
     */
    Component.prototype.getElem = function(elemName) {
        if (this.elems[elemName]) { return this.elems[elemName]; }

        var elem = qwery(this.getClass(elemName), this.elem)[0];
        this.elems[elemName] = elem;

        return elem;
    };

    /**
     * @param {string} eventName
     * @param {boolean} sansDot
     * @return {string}
     */
    Component.prototype.getClass = function(elemName, sansDot) {
        var className = this.useBem ? this.componentClass +'__'+ elemName : this.classes[elemName];

        return (sansDot ? '' : '.') + className;
    };

    /**
     * @param {string} state
     * @param {string|null} elemName
     */
    Component.prototype.setState = function(state, elemName) {
        var elem = elemName ? this.getElem(elemName) : this.elem;
        bonzo(elem).addClass(this.componentClass + (elemName ? '__'+ elemName : '') +'--'+ state);
    };

    /**
     * @param {string|null} state
     * @param {string|null} elemName
     * return {Boolean}
     */
    Component.prototype.removeState = function(state, elemName) {
        var elem = elemName ? this.getElem(elemName) : this.elem;
        return bonzo(elem).removeClass(this.componentClass + (elemName ? '__'+ elemName : '') +'--'+ state);
    };

    /**
     * @param {string|null} state
     * @param {string|null} elemName
     * return {Boolean}
     */
    Component.prototype.hasState = function(state, elemName) {
        var elem = elemName ? this.getElem(elemName) : this.elem;
        return bonzo(elem).hasClass(this.componentClass + (elemName ? '__'+ elemName : '') +'--'+ state);
    };

    /**
     * @return {Object}
     */
    Component.prototype.conf = function() {
        return this.constructor.CONFIG;
    };

    /**
     * @param {Object} options
     */
    Component.prototype.setOptions = function(options) {
        options = options || {};
        this.options = {};
        for (var prop in this.defaultOptions) {
            this.options[prop] = options.hasOwnProperty(prop) ? options[prop] : this.defaultOptions[prop];
        }
    };

    /**
     * Removes the event handling, leave the DOM
     */
    Component.prototype.detach = function() {
        bean.off(this.elem);
        delete this.elem;
    };

    /**
     * Removes all event listeners and removes the DOM elem
     */
    Component.prototype.destroy = function() {
        this.detach();
        if (this.elem) {
            bonzo(this.elem).remove();
        }
        this.destroyed = true;
    };

    /**
     * @param {Function} child
     */
    Component.define = function(child) {
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

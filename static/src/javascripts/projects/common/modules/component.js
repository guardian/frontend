/* jscs:disable disallowDanglingUnderscores */
define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/ajax',
    'lodash/objects/assign',
    'lodash/objects/clone'
], function (
    bean,
    bonzo,
    qwery,
    ajax,
    assign,
    clone) {

    /**
     * TODO (jamesgorrie):
     * * ERROR HANDLING!
     * * Find a way to run the Component constructor manually,
     *   Perhaps in the create method somewhere.
     * @constructor
     */
    var Component = function () {};

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

    /** @type {String} */
    Component.prototype.responseDataKey = 'html';

    /** @type {Boolean} */
    Component.prototype.autoupdated = false;

    /** @type {Number} in seconds */
    Component.prototype.updateEvery = 60;

    /** @type {Number} id of autoupdate timer */
    Component.prototype.t = null;

    /** @type {Object.<string.*>} data to send with fetch */
    Component.prototype.fetchData = null;

    /** @type {String} */
    Component.prototype.manipulationType = 'append';

    /**
     * Uses the this.componentClass
     * TODO (jamesgorrie): accept strings etc Also what to do with multiple objects?
     * @param {Element|string=} elem (optional)
     */
    Component.prototype.attachTo = function (elem) {
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
     * @param {Element=} parent (optional)
     */
    Component.prototype.render = function (parent) {
        this.checkAttached();
        var template = bonzo.create((this.template) ? this.template : document.getElementById('tmpl-' + this.templateName).innerHTML)[0],
            container = parent || document.body;

        this.elem = template;
        this._prerender();
        bonzo(container)[this.manipulationType](this.elem);
        this._ready();
        return this;
    };

    /**
     * Throws an error if this is already attached to the DOM
     */
    Component.prototype.checkAttached = function () {
        if (this.rendered) {
            throw new ComponentError('Already rendered');
        }
    };

    /**
     * @param {Element} parent
     * @param {String} key
     * @return {Reqwest}
     */
    Component.prototype.fetch = function (parent, key) {
        this.checkAttached();

        this.responseDataKey = key || this.responseDataKey;
        var self = this;

        return this._fetch().then(function render(resp) {
            self.elem = bonzo.create(resp[self.responseDataKey])[0];
            self._prerender();

            if (!self.destroyed) {
                bonzo(parent)[self.manipulationType](self.elem);
                self._ready(self.elem);
            }
        }).fail(function (xmlHttpRequest) {
            self.error(xmlHttpRequest);
        });
    };

    /**
     * @return Reqwest
     */
    Component.prototype._fetch = function () {
        var endpoint = (typeof this.endpoint === 'function') ? this.endpoint() : this.endpoint,
            self = this,
            opt;

        for (opt in this.options) {
            endpoint = endpoint.replace(':' + opt, this.options[opt]);
        }

        return ajax({
            url: endpoint,
            type: 'json',
            method: 'get',
            crossOrigin: true,
            data: this.fetchData
        }).then(function (resp) {
            self.fetched(resp);
            return resp;
        });
    };

    /**
     * This is just used to set up the component internally
     */
    Component.prototype._ready = function (elem) {
        if (!this.destroyed) {
            this.rendered = true;
            this._autoupdate();
            this.ready(elem);
        }
    };

    /**
     * Used as we need for pre-prerendering
     */
    Component.prototype._prerender = function () {
        this.elems = {};
        this.prerender();
    };

    /**
     * Check if we should auto update, if so, do so
     */
    Component.prototype._autoupdate = function () {
        var self = this;

        function update() {
            self._fetch().then(function (resp) {
                self.autoupdate(bonzo.create(resp[self.responseDataKey])[0]);
                if (self.autoupdated) {
                    self.t = setTimeout(update, self.updateEvery * 1000);
                }
            }, function () {
                self.t = setTimeout(update, self.updateEvery * 1000);
            });
        }

        if (this.autoupdated) {
            this.t = setTimeout(update, this.updateEvery * 1000);
        }
    };

    /**
     * This is user to edit this.elem before it's rendered
     * This will help with the rendering performance that
     * we would lose if rendered then manipulated
     */
    Component.prototype.prerender = function () {};

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your event binding
     * This function is made to be overridden
     */
    Component.prototype.ready = function () {};

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your error event binding
     * This function is made to be overridden
     */
    Component.prototype.error = function () {};

    /**
     * This is called whenever a fetch occurs. This includes
     * explicit fetch calls and autoupdate.
     */
    Component.prototype.fetched = function () {};

    /**
     * @param {Element} elem new element
     */
    Component.prototype.autoupdate = function (elem) {
        var oldElem = this.elem;
        this.elem = elem;

        this._prerender();
        bonzo(oldElem).replaceWith(this.elem);
    };

    /**
     * Once we're done with it, remove event bindings etc
     */
    Component.prototype.dispose = function () {};

    /**
     * @param {string} eventName
     * @param {Element|Function} elem if ommited which is also handler
     * @param {Function} handler
     */
    Component.prototype.on = function (eventName, elem, handler) {
        if (typeof elem === 'function') {
            handler = elem;
            bean.on(this.elem, eventName, handler.bind(this));
        } else {
            elem = !elem.length ? [elem] : elem;
            bean.on(this.elem, eventName, elem, handler.bind(this));
        }
        return this;
    };

    /**
     * @param {string} eventName
     * @param {Object=} args (optional)
     */
    Component.prototype.emit = function (eventName, args) {
        bean.fire(this.elem, eventName, args);
    };

    /**
     * TODO: After working on comments, wondering if this should support NodeLists
     * @param {string} elemName this corresponds to this.classes
     */
    Component.prototype.getElem = function (elemName) {
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
    Component.prototype.getClass = function (elemName, sansDot) {
        var className = this.useBem ? this.componentClass + '__' + elemName : this.classes[elemName];

        return (sansDot ? '' : '.') + className;
    };

    /**
     * @param {string} state
     * @param {string|null} elemName
     */
    Component.prototype.setState = function (state, elemName) {
        var elem = elemName ? this.getElem(elemName) : this.elem;
        bonzo(elem).addClass(this.componentClass + (elemName ? '__' + elemName : '') + '--' + state);
    };

    /**
     * @param {string|null} state
     * @param {string|null} elemName
     * return {Boolean}
     */
    Component.prototype.removeState = function (state, elemName) {
        var elem = elemName ? this.getElem(elemName) : this.elem;
        return bonzo(elem).removeClass(this.componentClass + (elemName ? '__' + elemName : '') + '--' + state);
    };

    /**
     * @param {string} state
     * @param {string|null} elemName
     */
    Component.prototype.toggleState = function (state, elemName) {
        var elem = elemName ? this.getElem(elemName) : this.elem;
        bonzo(elem).toggleClass(this.componentClass + (elemName ? '__' + elemName : '') + '--' + state);
    };

    /**
     * @param {string|null} state
     * @param {string|null} elemName
     * return {Boolean}
     */
    Component.prototype.hasState = function (state, elemName) {
        var elem = elemName ? this.getElem(elemName) : this.elem;
        return bonzo(elem).hasClass(this.componentClass + (elemName ? '__' + elemName : '') + '--' + state);
    };

    /**
     * @param {Object} options
     */
    Component.prototype.setOptions = function (options) {
        this.options = assign(clone(this.defaultOptions), this.options || {}, options);
    };

    /**
     * Removes the event handling, leave the DOM
     */
    Component.prototype.detach = function () {
        bean.off(this.elem);
    };

    /**
     * Removes all event listeners and removes the DOM elem
     */
    Component.prototype.destroy = function () {
        if (this.elem) {
            bonzo(this.elem).remove();
            delete this.elem;
        }

        clearTimeout(this.t);
        this.t = null;
        this.autoupdated = false;

        this.detach();
        this.destroyed = true;
        this.rendered = false;
    };

    /**
     * @param {Function} child
     */
    Component.define = function (child) {
        function Tmp() {}
        Tmp.prototype = Component.prototype;
        child.prototype = new Tmp();
        child.prototype.constructor = child;
    };

    /** @contructor */
    function ComponentError(message) {
        return new Error('Component: ' + message);
    }

    return Component;

});

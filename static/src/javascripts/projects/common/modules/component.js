// @flow

import assign from 'lodash/objects/assign';
import bean from 'bean';
import bonzo from 'bonzo';
import clone from 'lodash/objects/clone';
import fetchJSON from 'lib/fetch-json';
import qwery from 'qwery';

class ComponentError {
    constructor(message) {
        return new Error(`Component: ${message}`);
    }
}

class Component {
    useBem: boolean;
    templateName: ?string;
    componentClass: ?string;
    endpoint: ?string;
    classes: ?Array<any>; /* TODO */
    elem: ?HTMLElement;
    template: ?string;
    rendered: boolean;
    destroyed: boolean;
    elems: ?Object;
    options: ?Object;
    defaultOptions: Object;
    responseDataKey: string;
    autoupdated: boolean;
    updateEvery: number;
    fetchData: ?string;
    manipulationType: string;
    t: ?number;

    constructor() {
        this.useBem = false;
        this.templateName = null;
        this.componentClass = null;
        this.endpoint = null;
        this.classes = null;
        this.elem = null;
        this.template = null;
        this.rendered = false;
        this.destroyed = false;
        this.elems = null;
        this.options = null;
        this.defaultOptions = {};
        this.responseDataKey = 'html';
        this.autoupdated = false;
        this.updateEvery = 60;
        this.fetchData = null;
        this.manipulationType = 'append';
        this.t = null;
    }

    attachTo(elem) {
        this.checkAttached();

        if (!elem) {
            throw new ComponentError('Need element to attach to');
        } else {
            this.elem = elem;
            this._prerender();
            this._ready();
        }
    }

    render(parent) {
        this.checkAttached();
        let template = this.template;

        if (!template && this.templateName) {
            const templateEl = document.getElementById(
                `tmpl-${this.templateName}`
            );

            if (templateEl) {
                template = templateEl.innerHTML;
            }
        }

        if (template) {
            this.elem = bonzo.create(template)[0];
            this._prerender();
            bonzo(parent || document.body)[this.manipulationType](this.elem);
        }

        this._ready();
        return this;
    }

    /**
     * Throws an error if this is already attached to the DOM
     */
    checkAttached() {
        if (this.rendered) {
            throw new ComponentError('Already rendered');
        }
    }

    fetch(parent, key) {
        this.checkAttached();

        this.responseDataKey = key || this.responseDataKey;
        const self = this;

        return this._fetch()
            .then(resp => {
                self.elem = bonzo.create(resp[self.responseDataKey])[0];
                self._prerender();

                if (!self.destroyed) {
                    bonzo(parent)[self.manipulationType](self.elem);
                    self._ready(self.elem);
                }
            })
            .catch(self.error);
    }

    _fetch() {
        const endpoint =
            typeof this.endpoint === 'function'
                ? this.endpoint()
                : this.endpoint;
        const self = this;
        let opt;

        for (opt in this.options) {
            endpoint = endpoint.replace(`:${opt}`, this.options[opt]);
        }

        return fetchJSON(endpoint, {
            mode: 'cors',
            body: this.fetchData,
        }).then(resp => {
            self.fetched(resp);
            return resp;
        });
    }

    _ready(elem) {
        if (!this.destroyed) {
            this.rendered = true;
            this._autoupdate();
            this.ready(elem);
        }
    }

    _prerender() {
        this.elems = {};
        this.prerender();
    }

    /**
     * Check if we should auto update, if so, do so
     */
    _autoupdate() {
        const self = this;
        const setAutoUpdate = () => {
            self.t = setTimeout(update, self.updateEvery * 1000);
        };

        function update() {
            self
                ._fetch()
                .then(resp => {
                    self.autoupdate(
                        bonzo.create(resp[self.responseDataKey])[0]
                    );

                    if (self.autoupdated) {
                        setAutoUpdate();
                    }
                })
                .catch(() => {
                    setAutoUpdate();
                });
        }

        if (this.autoupdated) {
            setAutoUpdate();
        }
    }

    /**
     * This is user to edit this.elem before it's rendered
     * This will help with the rendering performance that
     * we would lose if rendered then manipulated
     */
    prerender() {}

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your event binding
     * This function is made to be overridden
     */
    ready() {}

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your error event binding
     * This function is made to be overridden
     */
    error() {}

    /**
     * This is called whenever a fetch occurs. This includes
     * explicit fetch calls and autoupdate.
     */
    fetched() {}

    autoupdate(elem) {
        const oldElem = this.elem;
        this.elem = elem;

        this._prerender();
        bonzo(oldElem).replaceWith(this.elem);
    }

    /**
     * Once we're done with it, remove event bindings etc
     */
    dispose() {}

    on(eventName, elem, handler) {
        if (typeof elem === 'function') {
            handler = elem;
            bean.on(this.elem, eventName, handler.bind(this));
        } else {
            elem = !elem.length ? [elem] : elem;
            bean.on(this.elem, eventName, elem, handler.bind(this));
        }
        return this;
    }

    emit(eventName, args) {
        bean.fire(this.elem, eventName, args);
    }

    getElem(elemName) {
        if (this.elems[elemName]) {
            return this.elems[elemName];
        }

        const elem = qwery(this.getClass(elemName), this.elem)[0];
        this.elems[elemName] = elem;

        return elem;
    }

    getClass(elemName, sansDot) {
        const className = this.useBem
            ? `${this.componentClass}__${elemName}`
            : this.classes[elemName];

        return (sansDot ? '' : '.') + className;
    }

    setState(state, elemName) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        bonzo(elem).addClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    removeState(state, elemName) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        return bonzo(elem).removeClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    toggleState(state, elemName) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        bonzo(elem).toggleClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    hasState(state, elemName) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        return bonzo(elem).hasClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    setOptions(options) {
        this.options = assign(
            clone(this.defaultOptions),
            this.options || {},
            options
        );
    }

    /**
     * Removes the event handling, leave the DOM
     */
    detach() {
        bean.off(this.elem);
    }

    /**
     * Removes all event listeners and removes the DOM elem
     */
    destroy() {
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
    }
}

export { Component };

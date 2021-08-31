/* eslint-disable no-underscore-dangle */

import bean from 'bean';
import bonzo from 'bonzo';
import { fetchJson } from '../../../lib/fetch-json';

class ComponentError {
    constructor(message) {
        return new Error(`Component: ${message}`);
    }
}

class Component {


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
        this.options = {};
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

        this.elem = elem;
        this._prerender();
        this._ready();
    }

    render(parent = document.body) {
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
            bonzo(parent)[this.manipulationType](this.elem);
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

        if (key) {
            this.responseDataKey = key;
        }

        return this._fetch()
            .then(resp => {
                this.elem = bonzo.create(resp[this.responseDataKey])[0];
                this._prerender();

                if (!this.destroyed) {
                    bonzo(parent)[this.manipulationType](this.elem);
                    this._ready(this.elem);
                }
            })
            .catch(err => this.error(err));
    }

    _fetch() {
        let endpoint =
            typeof this.endpoint === 'function'
                ? this.endpoint()
                : this.endpoint;

        if (typeof endpoint === 'string') {
            Object.keys(this.options).forEach(key => {
                const value = this.options[key];

                if (endpoint && value) {
                    endpoint = endpoint.replace(`:${key}`, value);
                }
            });
        }

        if (!endpoint) {
            return Promise.resolve({});
        }

        return fetchJson(endpoint, {
            mode: 'cors',
            body: this.fetchData,
        }).then(resp => {
            this.fetched(resp);
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
        const setAutoUpdate = () => {
            // eslint-disable-next-line no-use-before-define
            this.t = setTimeout(() => update(), this.updateEvery * 1000);
        };
        const update = () => {
            this._fetch()
                .then(resp => {
                    this.autoupdate(
                        bonzo.create(resp[this.responseDataKey])[0]
                    );

                    if (this.autoupdated) {
                        setAutoUpdate();
                    }
                })
                .catch(() => {
                    setAutoUpdate();
                });
        };

        if (this.autoupdated) {
            setAutoUpdate();
        }
    }

    /**
     * This is user to edit this.elem before it's rendered
     * This will help with the rendering performance that
     * we would lose if rendered then manipulated
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    prerender() {}

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your event binding
     * This function is made to be overridden
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    ready(elem) {}

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your error event binding
     * This function is made to be overridden
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    error(type, message) {}

    /**
     * This is called whenever a fetch occurs. This includes
     * explicit fetch calls and autoupdate.
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    fetched(resp) {}

    autoupdate(elem) {
        const oldElem = this.elem;
        this.elem = elem;

        this._prerender();
        bonzo(oldElem).replaceWith(this.elem);
    }

    /**
     * Once we're done with it, remove event bindings etc
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    dispose() {}

    on(
        eventType,
        elem,
        handler
    ) {
        if (typeof elem === 'function') {
            const eventHandler = elem;
            bean.on(this.elem, eventType, eventHandler.bind(this));
        } else if (typeof handler === 'function') {
            const selector = !elem.length ? [elem] : elem;
            bean.on(this.elem, eventType, selector, handler.bind(this));
        }

        return this;
    }

    emit(eventName, args) {
        bean.fire(this.elem, eventName, args);
    }

    getElem(elemName) {
        if (this.elems && this.elems[elemName]) {
            return this.elems[elemName];
        }

        const selector = this.getClass(elemName);
        // Previously we used the qwery library to select elements from the DOM
        // The method signature of qwery is: `qwery(selector, context)`
        // qwery defaults context to document
        const context = this.elem ?? document;
        // The previous code was: `const elem = qwery(selector, this.elem)[0];`
        // qwery has a quirk in the case of an invalid selector it returns
        // the children of the context node (i.e. this.elem)
        // querySelectorAll will however throw an exception
        // We kept the qwery behaviour to maintain backwards compatibility
        const elem = selector ?
            context.querySelectorAll(selector)[0] : context.children[0];

        if (elem && this.elems) {
            this.elems[elemName] = elem;
        }

        return elem;
    }

    getClass(elemName, sansDot = false) {
        let className;

        if (this.useBem && this.componentClass) {
            className = `${this.componentClass}__${elemName}`;
        } else {
            className = (this.classes && this.classes[elemName]) || '';
        }

        const selector = (sansDot ? '' : '.') + className;
        // An invalid selector is returned as undefined
        return selector === '' || selector === '.' ? undefined : selector;
    }

    setState(state, elemName) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        const $elem = bonzo(elem);

        if (this.componentClass) {
            $elem.addClass(
                `${this.componentClass +
                    (elemName ? `__${elemName}` : '')}--${state}`
            );
        }
    }

    removeState(state, elemName) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        const $elem = bonzo(elem);

        if (this.componentClass) {
            $elem.removeClass(
                `${this.componentClass +
                    (elemName ? `__${elemName}` : '')}--${state}`
            );
        }
    }

    toggleState(state, elemName) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        const $elem = bonzo(elem);

        if (this.componentClass) {
            $elem.toggleClass(
                `${this.componentClass +
                    (elemName ? `__${elemName}` : '')}--${state}`
            );
        }
    }

    hasState(state, elemName) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        const $elem = bonzo(elem);

        if (this.componentClass) {
            return $elem.hasClass(
                `${this.componentClass +
                    (elemName ? `__${elemName}` : '')}--${state}`
            );
        }

        return false;
    }

    setOptions(options) {
        this.options = Object.assign(
            {},
            this.defaultOptions,
            this.options,
            options
        );
    }

    /**
     * Removes all event listeners and removes the DOM elem
     */
    destroy() {
        if (this.elem) {
            bonzo(this.elem).remove();
            delete this.elem;
        }

        if (this.t) {
            window.clearTimeout(this.t);
        }

        this.t = null;
        this.autoupdated = false;

        bean.off(this.elem);

        this.destroyed = true;
        this.rendered = false;
    }
}

export { Component };

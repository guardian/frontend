// @flow
/* eslint-disable no-underscore-dangle */

import bean from 'bean';
import bonzo from 'bonzo';
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
    endpoint: ?string | ?(() => string);
    classes: ?Object;
    elem: ?(HTMLElement | HTMLAnchorElement | HTMLInputElement);
    template: ?string;
    rendered: boolean;
    destroyed: boolean;
    elems: ?Object;
    options: Object;
    defaultOptions: Object;
    responseDataKey: string;
    autoupdated: boolean;
    updateEvery: number;
    fetchData: ?string;
    manipulationType: string;
    t: ?TimeoutID;

    constructor(): void {
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

    attachTo(elem: HTMLElement): void {
        this.checkAttached();

        this.elem = elem;
        this._prerender();
        this._ready();
    }

    render(parent: HTMLElement | ?Node = document.body): Component {
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
    checkAttached(): void {
        if (this.rendered) {
            throw new ComponentError('Already rendered');
        }
    }

    fetch(parent: HTMLElement | Node, key?: string): Promise<void> {
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

    _fetch(): Promise<Object> {
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

        return fetchJSON(endpoint, {
            mode: 'cors',
            body: this.fetchData,
        }).then(resp => {
            this.fetched(resp);
            return resp;
        });
    }

    _ready(elem?: ?(HTMLElement | HTMLAnchorElement | HTMLInputElement)): void {
        if (!this.destroyed) {
            this.rendered = true;
            this._autoupdate();
            this.ready(elem);
        }
    }

    _prerender(): void {
        this.elems = {};
        this.prerender();
    }

    /**
     * Check if we should auto update, if so, do so
     */
    _autoupdate(): void {
        const setAutoUpdate = () => {
            // eslint-disable-next-line no-use-before-define
            this.t = setTimeout(() => update(), this.updateEvery * 1000);
        };
        const update = (): void => {
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
    prerender(): void {}

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your event binding
     * This function is made to be overridden
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    ready(elem: ?(HTMLElement | HTMLAnchorElement | HTMLInputElement)): void {}

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your error event binding
     * This function is made to be overridden
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    error(type: string, message?: string): void {}

    /**
     * This is called whenever a fetch occurs. This includes
     * explicit fetch calls and autoupdate.
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    fetched(resp: Object): void {}

    autoupdate(elem: HTMLElement): void {
        const oldElem = this.elem;
        this.elem = elem;

        this._prerender();
        bonzo(oldElem).replaceWith(this.elem);
    }

    /**
     * Once we're done with it, remove event bindings etc
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    dispose(): void {}

    on(
        eventType: string,
        elem: string | ((arg: any) => void),
        handler?: (arg: any) => void
    ): Component {
        if (typeof elem === 'function') {
            const eventHandler = elem;
            bean.on(this.elem, eventType, eventHandler.bind(this));
        } else if (typeof handler === 'function') {
            const selector = !elem.length ? [elem] : elem;
            bean.on(this.elem, eventType, selector, handler.bind(this));
        }

        return this;
    }

    emit(eventName: string, args?: mixed): void {
        bean.fire(this.elem, eventName, args);
    }

    getElem(elemName: string): ?(HTMLElement | HTMLInputElement) {
        if (this.elems && this.elems[elemName]) {
            return this.elems[elemName];
        }

        const elem = qwery(this.getClass(elemName), this.elem)[0];

        if (elem && this.elems) {
            this.elems[elemName] = elem;
        }

        return elem;
    }

    getClass(elemName: string, sansDot: boolean = false): string {
        let className;

        if (this.useBem && this.componentClass) {
            className = `${this.componentClass}__${elemName}`;
        } else {
            className = (this.classes && this.classes[elemName]) || '';
        }

        return (sansDot ? '' : '.') + className;
    }

    setState(state: string, elemName: ?string): void {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        const $elem = bonzo(elem);

        if (this.componentClass) {
            $elem.addClass(
                `${this.componentClass +
                    (elemName ? `__${elemName}` : '')}--${state}`
            );
        }
    }

    removeState(state: string, elemName: ?string): void {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        const $elem = bonzo(elem);

        if (this.componentClass) {
            $elem.removeClass(
                `${this.componentClass +
                    (elemName ? `__${elemName}` : '')}--${state}`
            );
        }
    }

    toggleState(state: string, elemName: ?string): void {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        const $elem = bonzo(elem);

        if (this.componentClass) {
            $elem.toggleClass(
                `${this.componentClass +
                    (elemName ? `__${elemName}` : '')}--${state}`
            );
        }
    }

    hasState(state: string, elemName: ?string): boolean {
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

    setOptions(options: Object): void {
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
    destroy(): void {
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

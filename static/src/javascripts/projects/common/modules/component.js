// @flow

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
    endpoint: ?string | ?() => string;
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

    render(parent: HTMLElement | ?Node = document.body) {
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

    fetch(parent: HTMLElement | ?Node, key: ?string): Promise<void> {
        const self = this;
        this.checkAttached();

        this.responseDataKey = key || this.responseDataKey;

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

    _fetch(): Promise<Object> {
        const self = this;
        let opt;
        let endpoint =
            typeof this.endpoint === 'function'
                ? this.endpoint()
                : this.endpoint;

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

    _ready(elem: HTMLElement): void {
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
    prerender(): void {}

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your event binding
     * This function is made to be overridden
     */
    ready(): void {}

    /**
     * Once the render / decorate methods have been called
     * This is where you could do your error event binding
     * This function is made to be overridden
     */
    error(): void {}

    /**
     * This is called whenever a fetch occurs. This includes
     * explicit fetch calls and autoupdate.
     */
    fetched(): void {}

    autoupdate(elem: HTMLElement): void {
        const oldElem = this.elem;
        this.elem = elem;

        this._prerender();
        bonzo(oldElem).replaceWith(this.elem);
    }

    /**
     * Once we're done with it, remove event bindings etc
     */
    dispose(): void {}

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

    emit(eventName: string, args?: Object): void {
        bean.fire(this.elem, eventName, args);
    }

    getElem(elemName: string): HTMLElement {
        if (this.elems[elemName]) {
            return this.elems[elemName];
        }

        const elem = qwery(this.getClass(elemName), this.elem)[0];
        this.elems[elemName] = elem;

        return elem;
    }

    getClass(elemName: string, sansDot: boolean = false): string {
        const className = this.useBem
            ? `${this.componentClass}__${elemName}`
            : this.classes[elemName];

        return (sansDot ? '' : '.') + className;
    }

    setState(state: string, elemName: ?string) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        bonzo(elem).addClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    removeState(state: string, elemName: ?string): void {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        return bonzo(elem).removeClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    toggleState(state: string, elemName: ?string): void {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        bonzo(elem).toggleClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    hasState(state: string, elemName: ?string): boolean {
        const elem = elemName ? this.getElem(elemName) : this.elem;

        return bonzo(elem).hasClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
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
     * Removes the event handling, leave the DOM
     */
    detach(): void {
        bean.off(this.elem);
    }

    /**
     * Removes all event listeners and removes the DOM elem
     */
    destroy(): void {
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

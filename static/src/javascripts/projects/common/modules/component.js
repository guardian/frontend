// @flow
/* eslint no-underscore-dangle: 0 */

import bean from 'bean';
import bonzo from 'bonzo';
import qwery from 'qwery';
import fetchJSON from 'lib/fetch-json';

class Component {
    autoupdated: boolean;
    classes: ?Object;
    componentClass: string;
    defaultOptions: Object;
    destroyed: boolean;
    edition: string;
    elem: ?(HTMLElement | HTMLLinkElement);
    elems: ?Object;
    endpoint: ?string;
    fetchData: ?Object;
    isInternational: boolean;
    isNetworkFront: boolean;
    isVideoFront: boolean;
    manipulationType: string;
    model: ?(Object | string);
    options: ?Object;
    parent: bonzo;
    placeholder: HTMLElement;
    rendered: boolean;
    responseDataKey: string;
    t: ?number;
    tab: qwery;
    template: ?(Object | string);
    templateName: ?string;
    updateEvery: number;
    useBem: boolean;

    constructor() {
        this.useBem = false;
        this.templateName = null;
        this.componentClass = '';
        this.endpoint = null;
        this.classes = null;
        this.elem = null;
        this.model = null;
        this.template = null;
        this.rendered = false;
        this.destroyed = false;
        this.elems = null;
        this.options = null;
        this.defaultOptions = {};
        this.responseDataKey = 'html';
        this.autoupdated = false;
        this.updateEvery = 60;
        this.t = null;
        this.fetchData = null;
        this.manipulationType = 'append';
    }

    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    error(err: Error): void {
        /* noop */
    }

    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    fetched(res: Object): void {
        /* noop */
    }

    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    prerender(): void {
        /* noop */
    }

    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    ready(elem: ?HTMLElement): void {
        /* noop */
    }

    attachTo(elem: HTMLElement): void {
        this.checkAttached();
        this.elem = elem;
        this._prerender();
        this._ready();
    }

    _autoupdate() {
        const setAutoUpdate = () => {
            const update = () => {
                this._fetch()
                    .then(resp => {
                        const markup = resp && resp[this.responseDataKey];

                        if (markup) {
                            this.autoupdate(bonzo.create(markup)[0]);

                            if (this.autoupdated) {
                                setAutoUpdate();
                            }
                        }
                    })
                    .catch(() => {
                        setAutoUpdate();
                    });
            };

            this.t = setTimeout(update, this.updateEvery * 1000);
        };

        if (this.autoupdated) {
            setAutoUpdate();
        }
    }

    autoupdate(elem: HTMLElement) {
        const oldElem = this.elem;
        this.elem = elem;

        this._prerender();
        bonzo(oldElem).replaceWith(this.elem);
    }

    checkAttached(): void {
        if (this.rendered) {
            throw new Error('Component already rendered');
        }
    }

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

    detach(): void {
        bean.off(this.elem);
    }

    emit(eventName: string, args?: Object) {
        bean.fire(this.elem, eventName, args);
    }

    _fetch(): Promise<void> {
        let endpoint =
            typeof this.endpoint === 'function'
                ? this.endpoint()
                : this.endpoint;

        if (endpoint) {
            Object.keys(this.options).forEach(opt => {
                const replacement = (this.options && this.options[opt]) || '';
                endpoint = endpoint.replace(`:${opt}`, replacement);
            });

            return fetchJSON(endpoint, {
                mode: 'cors',
                body: this.fetchData,
            }).then(resp => {
                this.fetched(resp);
                return resp;
            });
        }

        return Promise.reject();
    }

    fetch(parent: HTMLElement, key?: string): Promise<void> {
        this.checkAttached();
        this.responseDataKey = key || this.responseDataKey;

        return this._fetch()
            .then(resp => {
                const markup = resp && resp[this.responseDataKey];

                if (markup) {
                    this.elem = bonzo.create(markup)[0];
                    this._prerender();

                    if (!this.destroyed) {
                        bonzo(parent)[this.manipulationType](this.elem);
                        this._ready(this.elem);
                    }
                }
            })
            .catch(this.error);
    }

    getClass(elemName: string, sansDot?: boolean): string {
        const mappedClasses = this.classes && this.classes[elemName];
        const className = this.useBem
            ? `${this.componentClass}__${elemName}`
            : mappedClasses || '';

        return (sansDot ? '' : '.') + className;
    }

    getElem(elemName: string): HTMLLinkElement {
        let elem: HTMLLinkElement = (this.elems && this.elems[elemName]: any);

        if (elem) {
            return elem;
        }

        elem = qwery(this.getClass(elemName), this.elem)[0];

        if (!this.elems) {
            this.elems = {};
        }

        this.elems[elemName] = elem;

        return elem;
    }

    hasState(state: string, elemName: string): boolean {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        return bonzo(elem).hasClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    on(
        eventType: string,
        elem: string | ((event: Event) => void),
        handler?: (event: Event) => void
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

    _prerender(): void {
        this.elems = {};
        this.prerender();
    }

    _ready(elem: ?HTMLElement): void {
        if (!this.destroyed) {
            this.rendered = true;
            this._autoupdate();
            this.ready(elem);
        }
    }

    removeState(state: string, elemName?: string): bonzo {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        return bonzo(elem).removeClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    render(parent?: ?HTMLElement): Component {
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

    setOptions(options: Object) {
        this.options = Object.assign(
            {},
            this.defaultOptions,
            this.options || {},
            options
        );
    }

    setState(state: string, elemName?: string) {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        bonzo(elem).addClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }

    toggleState(state: string, elemName: string): bonzo {
        const elem = elemName ? this.getElem(elemName) : this.elem;
        bonzo(elem).toggleClass(
            `${this.componentClass +
                (elemName ? `__${elemName}` : '')}--${state}`
        );
    }
}

export { Component };

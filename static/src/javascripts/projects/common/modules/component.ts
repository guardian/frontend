import { isString } from '@guardian/libs';
import { fetchJson } from '../../../lib/fetch-json';

class ComponentError {
	constructor(message: string) {
		return new Error(`Component: ${message}`);
	}
}

type ManipulationType = 'append' | 'html';
type Parent = HTMLElement | Node;

const manipulate = (
	type: ManipulationType,
	parent: Parent,
	elem: HTMLElement,
): void => {
	switch (type) {
		case 'append':
			parent.appendChild(elem);
			break;
		case 'html':
			if ('innerHTML' in parent) parent.innerHTML = elem.innerHTML;
			else
				throw new Error(
					'Could not modify the parent’s HTML: Node type = ' +
						String(parent.nodeType),
				);
			break;
	}
};

class Component {
	useBem: boolean;
	templateName?: string;
	componentClass?: string;
	endpoint?: string | (() => string);
	classes?: Record<string, unknown>;
	elem?: HTMLElement | HTMLAnchorElement | HTMLInputElement;
	elems?: Record<string, unknown>;
	template?: string | null;
	rendered: boolean;
	destroyed: boolean;
	options: Record<string, string>;
	defaultOptions: Record<string, string>;
	responseDataKey: string;
	autoupdated: boolean;
	updateEvery: number;
	fetchData?: string;
	manipulationType: ManipulationType;
	t?: ReturnType<typeof setTimeout>;

	constructor() {
		this.useBem = false;
		this.templateName = undefined;
		this.componentClass = undefined;
		this.endpoint = undefined;
		this.classes = undefined;
		this.elem = undefined;
		this.elems = undefined;
		this.template = undefined;
		this.rendered = false;
		this.destroyed = false;
		this.options = {};
		this.defaultOptions = {};
		this.responseDataKey = 'html';
		this.autoupdated = false;
		this.updateEvery = 60;
		this.fetchData = undefined;
		this.manipulationType = 'append';
		this.t = undefined;
	}

	attachTo(elem: HTMLElement): void {
		this.checkAttached();

		this.elem = elem;
		this._prerender();
		this._ready();
	}

	render(parent: Parent = document.body): Component {
		this.checkAttached();
		let template = this.template;

		if (!template && this.templateName) {
			const templateEl = document.getElementById(
				`tmpl-${this.templateName}`,
			);

			if (templateEl) {
				template = templateEl.innerHTML;
			}
		}

		if (template) {
			const elem = document.createElement('div');
			elem.innerHTML = template;
			this.elem = elem;
			this._prerender();

			manipulate(this.manipulationType, parent, this.elem);
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

	async fetch(parent: Parent, key?: string): Promise<void> {
		this.checkAttached();

		if (key) {
			this.responseDataKey = key;
		}

		try {
			const resp = await this._fetch();
			const maybeHtmlString = resp[this.responseDataKey];
			if (!isString(maybeHtmlString))
				throw new Error(
					'response is not a valid string:' + String(maybeHtmlString),
				);

			const elem: HTMLDivElement = document.createElement('div');
			elem.innerHTML = maybeHtmlString;
			this.elem = elem;
			this._prerender();

			if (!this.destroyed) {
				manipulate(this.manipulationType, parent, this.elem);
				this._ready(this.elem);
			}
		} catch (err) {
			if (err instanceof Error) return this.error(err.name, err.message);
			return this.error('unknown');
		}
	}

	async _fetch(): Promise<Record<string, unknown>> {
		let endpoint =
			typeof this.endpoint === 'function'
				? this.endpoint()
				: this.endpoint;

		if (typeof endpoint === 'string') {
			Object.keys(this.options).forEach((key) => {
				const value = this.options[key];

				if (endpoint && value) {
					endpoint = endpoint.replace(`:${key}`, value);
				}
			});
		}

		if (!endpoint) {
			return Promise.resolve({});
		}

		const resp = await fetchJson(endpoint, {
			mode: 'cors',
			body: this.fetchData,
		});
		this.fetched(resp);
		return resp;
	}

	_ready(elem?: HTMLElement | HTMLAnchorElement | HTMLInputElement): void {
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
			this.t = setTimeout(() => update(), this.updateEvery * 1000);
		};
		const update = (): void => {
			this._fetch()
				.then((resp) => {
					this.autoupdate(
						bonzo.create(resp[this.responseDataKey])[0],
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
	prerender(): void {
		// Do nothing
	}

	/**
	 * Once the render / decorate methods have been called
	 * This is where you could do your event binding
	 *
	 * This function is made to be overridden
	 */
	ready(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- type annotation
		elem: HTMLElement | HTMLAnchorElement | HTMLInputElement | null,
	): void {
		// Meant to be overridden.
	}

	/**
	 * Once the render / decorate methods have been called
	 * This is where you could do your error event binding
	 *
	 * This function is made to be overridden
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- type annotation
	error(type: string, message?: string): void {
		// Meant to be overridden.
	}

	/**
	 * This is called whenever a fetch occurs. This includes
	 * explicit fetch calls and autoupdate.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- type annotation
	fetched(resp: Record<string, unknown>): void {
		// Do nothing
	}

	autoupdate(elem: HTMLElement): void {
		const oldElem = this.elem;
		this.elem = elem;

		this._prerender();
		bonzo(oldElem).replaceWith(this.elem);
	}

	/**
	 * Once we're done with it, remove event bindings etc
	 */
	dispose(): void {
		// Do nothing
	}

	on(
		eventType: string,
		elem: string | ((arg: any) => void),
		handler?: (arg: any) => void,
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

	emit(eventName: string, args?: unknown): void {
		bean.fire(this.elem, eventName, args);
	}

	getElem(elemName: string): HTMLElement | HTMLInputElement | null {
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

	setState(state: string, elemName: string | null): void {
		const elem = elemName ? this.getElem(elemName) : this.elem;
		const $elem = bonzo(elem);

		if (this.componentClass) {
			$elem.addClass(
				`${
					this.componentClass + (elemName ? `__${elemName}` : '')
				}--${state}`,
			);
		}
	}

	removeState(state: string, elemName: string | null): void {
		const elem = elemName ? this.getElem(elemName) : this.elem;
		const $elem = bonzo(elem);

		if (this.componentClass) {
			$elem.removeClass(
				`${
					this.componentClass + (elemName ? `__${elemName}` : '')
				}--${state}`,
			);
		}
	}

	toggleState(state: string, elemName: string | null): void {
		const elem = elemName ? this.getElem(elemName) : this.elem;
		const $elem = bonzo(elem);

		if (this.componentClass) {
			$elem.toggleClass(
				`${
					this.componentClass + (elemName ? `__${elemName}` : '')
				}--${state}`,
			);
		}
	}

	hasState(state: string, elemName: string | null): boolean {
		const elem = elemName ? this.getElem(elemName) : this.elem;
		const $elem = bonzo(elem);

		if (this.componentClass) {
			return $elem.hasClass(
				`${
					this.componentClass + (elemName ? `__${elemName}` : '')
				}--${state}`,
			);
		}

		return false;
	}

	setOptions(options: Record<string, unknown>): void {
		this.options = Object.assign(
			{},
			this.defaultOptions,
			this.options,
			options,
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

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

const create = (maybeHtmlString: unknown): HTMLDivElement => {
	if (!isString(maybeHtmlString))
		throw new Error(
			'response is not a valid string:' + String(maybeHtmlString),
		);

	const elem: HTMLDivElement = document.createElement('div');
	elem.innerHTML = maybeHtmlString;

	return elem;
};

class Component {
	useBem: boolean;
	templateName?: string;
	componentClass?: string;
	endpoint?: string | (() => string);
	classes?: Record<string, string>;
	elem?: HTMLElement;
	elems?: Record<string, HTMLElement>;
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
	t?: number;

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
			this.elem = create(maybeHtmlString);
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

	_ready(elem?: HTMLElement): void {
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
			this.t = window.setTimeout(() => update(), this.updateEvery * 1000);
		};
		const update = (): void => {
			this._fetch()
				.then((resp) => {
					const elem = create(resp[this.responseDataKey]);
					this.autoupdate(elem);

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
		elem?: HTMLElement,
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
		oldElem?.replaceWith(this.elem);
	}

	/**
	 * Once we're done with it, remove event bindings etc
	 */
	dispose(): void {
		// Do nothing
	}

	on(
		eventType: string,
		elem: string | EventListener,
		handler?: EventListener,
	): Component {
		if (typeof elem === 'function') {
			const eventHandler = elem;
			this.elem?.addEventListener(eventType, eventHandler.bind(this));
		} else if (typeof handler === 'function') {
			const target = this.elem?.querySelectorAll(elem);
			target?.forEach((e) =>
				e.addEventListener(eventType, handler.bind(this)),
			);
		}

		return this;
	}

	emit(eventName: string, args?: unknown): void {
		const event = args
			? // TODO: look if this custom event is ever used / called
			  new CustomEvent(eventName, { detail: args })
			: new Event(eventName);
		this.elem?.dispatchEvent(event);
	}

	getElem(elemName: string): HTMLElement | null {
		if (this.elems?.[elemName]) {
			return this.elems[elemName];
		}

		const elem = this.elem?.querySelector<HTMLElement>(
			this.getClass(elemName),
		);

		if (elem && this.elems) {
			this.elems[elemName] = elem;
		}

		return elem ?? null;
	}

	getClass(elemName: string, sansDot = false): string {
		let className: string;

		if (this.useBem && this.componentClass) {
			className = `${this.componentClass}__${elemName}`;
		} else {
			className = this.classes?.[elemName] ?? '';
		}

		return (sansDot ? '' : '.') + className;
	}

	setState(state: string, elemName?: string): void {
		const elem = elemName ? this.getElem(elemName) : this.elem;

		if (!elem || !this.componentClass) return;

		elem.classList.add(
			`${
				this.componentClass + (elemName ? `__${elemName}` : '')
			}--${state}`,
		);
	}

	removeState(state: string, elemName?: string): void {
		const elem = elemName ? this.getElem(elemName) : this.elem;

		if (!elem || !this.componentClass) return;

		elem.classList.remove(
			`${
				this.componentClass + (elemName ? `__${elemName}` : '')
			}--${state}`,
		);
	}

	toggleState(state: string, elemName?: string): void {
		const elem = elemName ? this.getElem(elemName) : this.elem;

		if (!elem || !this.componentClass) return;

		elem.classList.toggle(
			`${
				this.componentClass + (elemName ? `__${elemName}` : '')
			}--${state}`,
		);
	}

	hasState(state: string, elemName?: string): boolean {
		const elem = elemName ? this.getElem(elemName) : this.elem;
		if (!elem || !this.componentClass) return false;

		return elem.classList.contains(
			`${
				this.componentClass + (elemName ? `__${elemName}` : '')
			}--${state}`,
		);
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
			this.elem.remove();
			delete this.elem;
		}

		if (this.t) {
			window.clearTimeout(this.t);
		}

		this.t = undefined;
		this.autoupdated = false;

		this.destroyed = true;
		this.rendered = false;
	}
}

export { Component };

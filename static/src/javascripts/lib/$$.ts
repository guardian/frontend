import type CSS from 'csstype';

/**
 * Provides a shorthand wrapper over vanilla DOM manipulation
 */
class $$ {
	/**
	 * An array of the matched elements
	 */
	#elements: HTMLElement[];

	constructor(query: string, context?: HTMLElement) {
		this.#elements = Array.from(
			(context ?? document).querySelectorAll(query),
		);
	}

	/**
	 * Gets matched elements.
	 * If an index is passed, only the element at that index is returned. Otherwise an array of all matched elements is returned.
	 */
	get(): HTMLElement[];
	get(index: number): HTMLElement;
	get(index?: number): HTMLElement | HTMLElement[] {
		if (typeof index === 'number') return this.#elements[index];
		return this.#elements;
	}

	// https://github.com/LeaVerou/bliss/blob/master/bliss.shy.js#L705
	/**
	 * Set attributes on all matched elements.
	 */
	setAttributes(attrs: Record<string, string>): $$ {
		Object.entries(attrs).forEach(([prop, val]) =>
			this.#elements.forEach((element) =>
				element.setAttribute(prop, val),
			),
		);
		return this;
	}

	// https://github.com/LeaVerou/bliss/blob/master/bliss.shy.js#L692
	/**
	 * Set CSS properties on all matched elements.
	 */
	css(styles: CSS.Properties): $$ {
		Object.entries(styles).forEach(([prop, val]) => {
			this.#elements.forEach((element) =>
				element.style.setProperty(prop, val),
			);
		});
		return this;
	}

	/**
	 * Removes all matched elements from the DOM.
	 */
	remove(): void {
		this.#elements.forEach((element) =>
			element.parentNode?.removeChild(element),
		);
	}
}

const _$$ = (query: string, context?: HTMLElement): $$ =>
	new $$(query, context);

export { _$$ as $$ };

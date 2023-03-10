/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import type { RegisterListener } from '@guardian/commercial-core';
import { isObject } from '@guardian/libs';

interface StylesheetSpecs {
	selector: string;
}

const isStyleSpecs = (specs: unknown): specs is StylesheetSpecs =>
	isObject(specs) && 'selector' in specs;

const getStyles = (
	specs: StylesheetSpecs,
	styleSheets: StyleSheetList,
): string[] => {
	const result: string[] = [];
	for (let i = 0; i < styleSheets.length; i += 1) {
		const ownerNode = styleSheets[i].ownerNode;

		if (
			ownerNode instanceof HTMLStyleElement &&
			ownerNode.matches(specs.selector)
		) {
			ownerNode.textContent !== null &&
				result.push(ownerNode.textContent);
		}
		/*
			There could be link elements here too, but we don't care about them as we cannot access the CSS
			text content in them anyway.
			This is due to the fact that they are on separate domains like `assets.guim.co.uk`, accessing the text
			from them results in a CORS error.
		 */
	}
	return result;
};

const init = (register: RegisterListener): void => {
	register('get-styles', (specs) => {
		if (isStyleSpecs(specs)) {
			return getStyles(specs, document.styleSheets);
		}
	});
};

export const _ = { getStyles, isStyleSpecs };

export { init };

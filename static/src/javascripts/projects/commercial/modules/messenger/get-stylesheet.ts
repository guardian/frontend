import type { RegisterListener } from '@guardian/commercial-core';
import { isObject } from '@guardian/libs';

interface StylesheetSpecs {
	selector: string;
}

const isStyleSpecs = (specs: unknown): specs is StylesheetSpecs =>
	isObject(specs) && 'selector' in specs;

const getStyles = (
	specs: StylesheetSpecs | undefined,
	styleSheets: StyleSheetList,
): string[] => {
	if (!specs || typeof specs.selector !== 'string') {
		return [];
	}

	const result: string[] = [];
	for (let i = 0; i < styleSheets.length; i += 1) {
		const ownerNode = styleSheets[i].ownerNode;

		if (
			ownerNode instanceof HTMLStyleElement &&
			ownerNode.matches(specs.selector)
		) {
			ownerNode.textContent !== null &&
				result.push(ownerNode.textContent);

			// if it's a link, we can't access the CSS rules because of CORS and the stylesheets are on another domain
		}
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

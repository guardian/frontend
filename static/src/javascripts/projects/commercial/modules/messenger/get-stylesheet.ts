import { isObject } from '@guardian/libs';
import type { RegisterListener } from '../messenger';

type Specs = {
	selector: string;
};

const isSpecs = (specs: unknown): specs is Specs =>
	isObject(specs) && typeof specs.selector === 'string';

const getStyles = (specs: Specs, styleSheets: StyleSheetList): string[] => {
	const result = [];
	for (let i = 0; i < styleSheets.length; i += 1) {
		const sheet = styleSheets[i];
		const ownerNode = sheet.ownerNode;

		if (ownerNode instanceof Element) {
			if (ownerNode.matches(specs.selector)) {
				if (
					ownerNode.tagName === 'STYLE' &&
					ownerNode.textContent !== null
				) {
					result.push(ownerNode.textContent);
				} else {
					result.push(
						[...sheet.cssRules].reduce((acc, input) => {
							return acc + input.cssText;
						}, ''),
					);
				}
			}
		}
	}
	return result;
};

const init = (register: RegisterListener): string[] | void => {
	register('get-styles', (specs: unknown) => {
		if (isSpecs(specs)) {
			return getStyles(specs, document.styleSheets);
		}
	});
};

export const _ = { getStyles };

export { init, getStyles };

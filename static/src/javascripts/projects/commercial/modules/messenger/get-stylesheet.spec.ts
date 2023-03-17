/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { _ } from './get-stylesheet';

const { getStyles, isStyleSpecs } = _;

let styleSheets: StyleSheetList;

// an aproximation of the register callback
const register = (specs: unknown, styleSheets: StyleSheetList) => {
	if (isStyleSpecs(specs)) {
		return getStyles(specs, styleSheets);
	}
	return null;
};

describe('Cross-frame messenger: get stylesheets', () => {
	beforeEach((done) => {
		document.body.innerHTML = `
            <style class="webfont"></style>
            <style class="webfont" data-cache-name="GuardianSansWeb"></style>
            <style class="webfont" data-cache-name="GuardianSansTextWeb"></style>
            <style class="notawebfont"></style>`;

		// Why are we having to mess about with the DOM? JSDOM does not recognise
		// `ownerNode`: https://github.com/tmpvar/jsdom/issues/992
		// @ts-expect-error -- this is a stub
		styleSheets = Array.from(document.styleSheets).map((style, i) => {
			const ownerNode = document.querySelectorAll('style')[i];
			Object.assign(style, { ownerNode });
			return style;
		});

		done();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('should return nothing if there is no CSS selector', () => {
		expect(register({}, document.styleSheets)).toBeNull();
		expect(
			register({ dontcare: 'hello' }, document.styleSheets),
		).toBeNull();
	});

	it('should return all webfonts available', () => {
		expect(styleSheets.length).toBe(4);
		const result = register({ selector: '.webfont' }, styleSheets);
		expect(result).not.toBeNull();
		expect(result?.length).toBe(3);
	});

	it('should return only the GuardianSansWeb webfont', () => {
		const selector = '.webfont[data-cache-name="GuardianSansWeb"]';
		const result = register({ selector }, styleSheets);
		expect(result).not.toBeNull();
		expect(result?.length).toBe(1);
	});

	it('should return only the GuardianSansWeb and GuardianSansTextWeb webfonts', () => {
		const selector =
			'.webfont[data-cache-name="GuardianSansWeb"], .webfont[data-cache-name="GuardianSansTextWeb"]';
		const result = register({ selector }, styleSheets);
		expect(result).not.toBeNull();
		expect(result?.length).toBe(2);
	});
});

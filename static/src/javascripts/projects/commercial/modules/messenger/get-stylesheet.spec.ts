import { _ } from './get-stylesheet';

const getStyles = _.getStyles;

let styleSheets: StyleSheetList;

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

	it('should return all webfonts available', () => {
		expect(styleSheets.length).toBe(4);
		const result = getStyles({ selector: '.webfont' }, styleSheets);
		expect(result).not.toBeNull();
		expect(result.length).toBe(3);
	});

	it('should return only the GuardianSansWeb webfont', () => {
		const selector = '.webfont[data-cache-name="GuardianSansWeb"]';
		const result = getStyles({ selector }, styleSheets);
		expect(result).not.toBeNull();
		expect(result.length).toBe(1);
	});

	it('should return only the GuardianSansWeb and GuardianSansTextWeb webfonts', () => {
		const selector =
			'.webfont[data-cache-name="GuardianSansWeb"], .webfont[data-cache-name="GuardianSansTextWeb"]';
		const result = getStyles({ selector }, styleSheets);
		expect(result).not.toBeNull();
		expect(result.length).toBe(2);
	});
});

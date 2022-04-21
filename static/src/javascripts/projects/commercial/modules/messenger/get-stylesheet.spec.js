import { _ } from './get-stylesheet';

const getStyles = _.getStyles;

let styleSheets;

describe('Cross-frame messenger: get stylesheets', () => {
	beforeEach((done) => {
		if (document.body) {
			document.body.innerHTML = `
            <style class="webfont"></style>
            <style class="webfont" data-cache-name="GuardianSansWeb"></style>
            <style class="webfont" data-cache-name="GuardianSansTextWeb"></style>
            <style class="notawebfont"></style>`;
		}

		// Why are we having to mess about with the DOM? JSDOM does not recognise
		// `ownerNode`: https://github.com/tmpvar/jsdom/issues/992
		styleSheets = Array.prototype.map.call(
			document.querySelectorAll('style'),
			(style) =>
				Object.assign(
					{
						ownerNode: Object.assign(
							{
								matches: (selector) => {
									const res = Array.prototype.slice.call(
										document.querySelectorAll(selector),
									);
									return res.includes(style);
								},
							},
							style,
						),
					},
					style,
				),
		);

		done();
	});

	afterEach(() => {
		if (document.body) {
			document.body.innerHTML = '';
		}
	});

	it('should return nothing if there is no CSS selector', () => {
		expect(getStyles({})).toBeNull();
		expect(getStyles({ dontcare: 'hello' }, [])).toBeNull();
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

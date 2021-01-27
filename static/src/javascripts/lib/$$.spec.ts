import { $$ } from './$$';

beforeEach(() => {
	document.body.innerHTML = `
        <div class="grandparent" id="a">
            <div class="parent child" id="b">
                <div class="child" id="c">child content</div>
                <div class="child sibling" id="d">sibling content</div>
            </div>
            <div class="parent child sibling" id="e">
                <div class="child" id="f">child content</div>
                <div class="child sibling" id="g">sibling content</div>
            </div>
        </div>`;
});

describe('$$', () => {
	test('locates the correct elements', () => {
		expect($$('.child').get().length).toBe(6);
		expect(
			$$('.child', document.getElementById('e') ?? undefined).get()
				.length,
		).toBe(2);
	});

	test('gets elements', () => {
		const els = $$('.child');
		expect(els.get(1).id).toMatch('c');
		expect(els.get(123456789)).toBeUndefined();
	});

	test('sets attributes on elements', () => {
		const els = $$('.child');

		els.get().forEach((element) => {
			expect(element.getAttribute('a')).toBeFalsy();
			expect(element.getAttribute('b')).toBeFalsy();
		});

		els.setAttributes({ a: 'a', b: 'b' });

		els.get().forEach((element) => {
			expect(element.getAttribute('a')).toMatch('a');
			expect(element.getAttribute('b')).toMatch('b');
		});
	});

	test('sets CSS on elements', () => {
		const els = $$('.child');

		els.get().forEach((element) => {
			expect(element.style.color).toBeFalsy();
		});

		els.css({ color: 'red' });

		els.get().forEach((element) => {
			expect(element.style.color).toMatch('red');
		});
	});

	test('removes elements', () => {
		expect(document.querySelectorAll('.child').length).toBeGreaterThan(0);
		$$('.child').remove();
		expect(document.querySelectorAll('.child').length).toBe(0);
	});
});

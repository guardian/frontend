/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { noop } from '../../../../lib/noop';
import { init } from './gallery';
import { galleryHtml } from './gallery-html';

/**
 * An example of this feature is:
 * https://www.theguardian.com/advertiser-content/microsoft-ai-for-earth/meet-the-changemakers
 */

jest.mock('../../../../lib/detect', () => ({
	hasPushStateSupport: jest.fn(),
	getBreakpoint: jest.fn(),
	hasTouchScreen: jest.fn(),
}));
jest.mock('../../../../lib/load-css-promise', () => ({
	loadCssPromise: Promise.resolve(),
}));

let gallery;

describe('Hosted Gallery', () => {
	beforeEach((done) => {
		if (document.body) {
			document.body.innerHTML = galleryHtml;
		}
		init().then((galleryInstance) => {
			gallery = galleryInstance;
			done();
		});
	});

	afterEach(() => {
		jest.resetAllMocks();

		if (document.body) {
			document.body.innerHTML = '';
		}
	});

	it('should exist', (done) => {
		expect(gallery).toBeDefined();
		done();
	});

	const classListFor = (className) =>
		document.querySelector(`.${className}`).classList.toString();

	it('should open and close the caption on click', () => {
		const button = document.querySelector('.js-gallery-caption-button');

		button.click();

		expect(classListFor('js-gallery-caption-bar')).toEqual(
			expect.stringContaining('hosted-gallery--show-caption'),
		);

		button.click();

		expect(classListFor('js-gallery-caption-bar')).not.toEqual(
			expect.stringContaining('hosted-gallery--show-caption'),
		);
	});

	it('should open and close  the caption on pressing "i"', () => {
		gallery.handleKeyEvents({ keyCode: 73 });

		expect(classListFor('js-gallery-caption-bar')).toEqual(
			expect.stringContaining('hosted-gallery--show-caption'),
		);

		gallery.handleKeyEvents({ keyCode: 73 });

		expect(classListFor('js-gallery-caption-bar')).not.toEqual(
			expect.stringContaining('hosted-gallery--show-caption'),
		);
	});

	it('should open and close the onward journey on click', () => {
		const button = document.querySelector('.js-hosted-gallery-oj-close');
		button.click();

		expect(classListFor('js-hosted-gallery-oj')).toEqual(
			expect.stringContaining('minimise-oj'),
		);

		button.click();

		expect(classListFor('js-hosted-gallery-oj')).not.toEqual(
			expect.stringContaining('minimise-oj'),
		);
	});
});

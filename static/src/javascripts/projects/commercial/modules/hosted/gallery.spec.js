import interactionTracking from '../../../common/modules/analytics/interaction-tracking';
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
jest.mock('../../../common/modules/analytics/interaction-tracking', () => ({
	trackNonClickInteraction: jest.fn(() => Promise.resolve()),
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

	it('should log navigation in GA when using arrow key navigation', () => {
		gallery.handleKeyEvents({ keyCode: 40, preventDefault: noop });
		expect(
			interactionTracking.trackNonClickInteraction,
		).toHaveBeenCalledWith('KeyPress:down - image 2');
		gallery.handleKeyEvents({ keyCode: 39, preventDefault: noop });
		expect(
			interactionTracking.trackNonClickInteraction,
		).toHaveBeenCalledWith('KeyPress:right - image 3');
		gallery.handleKeyEvents({ keyCode: 38, preventDefault: noop });
		expect(
			interactionTracking.trackNonClickInteraction,
		).toHaveBeenCalledWith('KeyPress:up - image 2');
		gallery.handleKeyEvents({ keyCode: 37, preventDefault: noop });
		expect(
			interactionTracking.trackNonClickInteraction,
		).toHaveBeenCalledWith('KeyPress:left - image 1');
	});

	it('should log navigation in GA when clicking through images', () => {
		gallery.initScroll.call(gallery);
		document.querySelector('.inline-arrow-down').click();
		expect(
			interactionTracking.trackNonClickInteraction,
		).toHaveBeenCalledWith('Click - image 2');
		document.querySelector('.inline-arrow-up').click();
		expect(
			interactionTracking.trackNonClickInteraction,
		).toHaveBeenCalledWith('Click - image 1');
	});

	it('should log navigation in GA when scrolling through images', () => {
		const nativeHTMLElement = window.HTMLElement;
		window.HTMLElement = function () {
			this.scrollTop = 20;
			this.scrollHeight = 30;
		};
		gallery.fadeContent({
			target: new window.HTMLElement(),
		});
		expect(
			interactionTracking.trackNonClickInteraction,
		).toHaveBeenCalledWith('Scroll - image 3');
		window.HTMLElement = nativeHTMLElement;
	});
});

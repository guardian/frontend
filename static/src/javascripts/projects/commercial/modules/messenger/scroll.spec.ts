/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { noop } from 'lib/noop';
import { _ as testExports } from './scroll';

const addScrollListener = testExports.addScrollListener;
const removeScrollListener = testExports.removeScrollListener;
const reset = testExports.reset;

const mockViewport = (width: number, height: number): void => {
	Object.defineProperties(window, {
		innerWidth: {
			value: width,
		},
		innerHeight: {
			value: height,
		},
	});
};

// TODO either remove or resolve flakiness of these tests.
describe.skip('Cross-frame messenger: scroll', () => {
	let iframe1: HTMLIFrameElement | null;
	let iframe2: HTMLIFrameElement | null;
	let onScroll = () => Promise.resolve();

	const respond1 = jest.fn();
	const respond2 = jest.fn();

	const domSnippet = `
         <div id="ad-slot-1" class="js-ad-slot"><iframe id="iframe1" style="height: 200px"></iframe></div>
         <div id="ad-slot-2" class="js-ad-slot"><iframe id="iframe2" style="height: 200px"></iframe></div>
     `;

	const mockIframePosition = (
		iframe: HTMLIFrameElement | null,
		top: number,
	) => {
		if (!iframe) return;
		jest.spyOn(iframe, 'getBoundingClientRect').mockImplementationOnce(
			() => ({
				left: 8,
				right: 392,
				height: 200,
				width: 384,
				top,
				bottom: top + 200,
				x: 0,
				y: 0,
				toJSON: () => null,
			}),
		);
	};

	beforeEach(() => {
		jest.spyOn(global, 'addEventListener').mockImplementation(
			(_, callback) => {
				// @ts-expect-error -- it used to work in JS
				onScroll = callback;
			},
		);
		jest.spyOn(global, 'removeEventListener').mockImplementation(() => {
			onScroll = () => Promise.resolve();
		});
		document.body.innerHTML = domSnippet;
		iframe1 = <HTMLIFrameElement>document.getElementById('iframe1');
		iframe2 = <HTMLIFrameElement>document.getElementById('iframe2');

		mockViewport(400, 300);

		expect.hasAssertions();
	});

	afterEach(() => {
		iframe1 && removeScrollListener(iframe1);
		iframe2 && removeScrollListener(iframe2);
		iframe1 = null;
		iframe2 = null;
		jest.resetModules();
		jest.resetAllMocks();
		document.body.innerHTML = '';
	});

	type ObsCallback = (
		entries: Array<
			Pick<IntersectionObserverEntryInit, 'intersectionRatio' | 'target'>
		>,
	) => void;

	describe('With IntersectionObserver', () => {
		let onIntersect: ObsCallback | null = null;
		class IntersectionObserver {
			constructor(callback: ObsCallback) {
				onIntersect = callback;
				return Object.freeze({
					observe: noop,
					unobserve: noop,
					disconnect: () => {
						onIntersect = null;
					},
				});
			}
		}

		beforeEach(() => {
			Object.defineProperty(global, 'IntersectionObserver', {
				value: IntersectionObserver,
				writable: true,
			});
			reset(true);
			iframe1 && addScrollListener(iframe1, respond1);
			iframe2 && addScrollListener(iframe2, respond2);
		});

		afterEach(() => {
			Object.defineProperty(global, 'IntersectionObserver', {
				value: null,
				writable: true,
			});
		});

		it('should call respond1 but not respond2 at the top of the page', () => {
			if (!iframe1 || !iframe2) return false;

			mockIframePosition(iframe1, 8);
			mockIframePosition(iframe2, 6320);
			if (onIntersect) {
				onIntersect([
					{ target: iframe1, intersectionRatio: 0.5 },
					{ target: iframe2, intersectionRatio: 0 },
				]);
			}
			return onScroll().then(() => {
				expect(respond1).toHaveBeenCalledTimes(2);
				expect(respond2).toHaveBeenCalledTimes(1);
			});
		});

		it('should call respond2 but not respond1 at the bottom of the page', () => {
			if (!iframe1 || !iframe2) return false;

			mockIframePosition(iframe1, -6304);
			mockIframePosition(iframe2, 8);
			if (onIntersect) {
				onIntersect([
					{ target: iframe1, intersectionRatio: 0 },
					{ target: iframe2, intersectionRatio: 0.5 },
				]);
			}
			return onScroll().then(() => {
				expect(respond1).toHaveBeenCalledTimes(1);
				expect(respond2).toHaveBeenCalledTimes(2);
			});
		});
	});

	describe('Without IntersectionObserver', () => {
		beforeEach(() => {
			reset(false);
			return Promise.all([
				iframe1 && addScrollListener(iframe1, respond1),
				iframe2 && addScrollListener(iframe2, respond2),
			]);
		});

		it('should call respond1 but not respond2 at the top of the page', () => {
			mockIframePosition(iframe1, 8);
			mockIframePosition(iframe2, 6320);
			return onScroll().then(() => {
				expect(respond1).toHaveBeenCalledTimes(2);
				expect(respond2).toHaveBeenCalledTimes(1);
			});
		});

		it('should call respond2 but not respond1 at the bottom of the page', () => {
			mockIframePosition(iframe1, -6304);
			mockIframePosition(iframe2, 8);
			return onScroll().then(() => {
				expect(respond1).toHaveBeenCalledTimes(1);
				expect(respond2).toHaveBeenCalledTimes(2);
			});
		});
	});
});

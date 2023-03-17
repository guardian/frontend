/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { _ as testExports } from './viewport';

const addResizeListener = testExports.addResizeListener;
const reset = testExports.reset;

const domSnippet = `
    <div id="ad-slot-1" class="js-ad-slot">
		<iframe id="iframe1" style="height: 200px"></iframe>
	</div>
`;

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

describe('Cross-frame messenger: viewport', () => {
	const respond = jest.fn();
	let iframe: HTMLIFrameElement;
	let onResize: (() => void) | null;

	const mockWindow: Window = {
		// @ts-expect-error --we want to override the window event listener
		addEventListener(_: string, callback: () => void) {
			onResize = callback;
		},
		removeEventListener() {
			onResize = null;
		},
	};

	beforeEach(() => {
		document.body.innerHTML = domSnippet;
		iframe = document.getElementById('iframe1') as HTMLIFrameElement;
		reset(mockWindow);
		expect.hasAssertions();
	});

	afterEach(() => {
		reset();
		document.body.innerHTML = '';
	});

	it('should send viewport dimensions as soon as the iframe starts listening', () => {
		const size = {
			width: 800,
			height: 600,
		};
		mockViewport(size.width, size.height);
		return addResizeListener(iframe, respond).then(() => {
			expect(respond).toHaveBeenCalledWith(null, size);
		});
	});

	it('should send viewport dimensions when the window gets resized', () => {
		const size = {
			width: 1024,
			height: 768,
		};
		mockViewport(size.width, size.height);
		return addResizeListener(iframe, respond)
			.then(() => onResize?.())
			.then(() => {
				expect(respond).toHaveBeenCalledWith(null, size);
			});
	});
});

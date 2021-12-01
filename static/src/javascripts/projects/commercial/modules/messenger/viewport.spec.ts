import { _ as testExports } from './viewport';

const addResizeListener = testExports.addResizeListener;
const reset = testExports.reset;

jest.mock('../../../../lib/detect', () => ({
	getViewport: jest.fn(),
}));

jest.mock('../messenger', () => ({
	register: jest.fn(),
}));

const domSnippet = `
    <div id="ad-slot-1" class="js-ad-slot"><div id="iframe1" style="height: 200px"></div></div>
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
	let iframe: HTMLElement | null;
	let onResize: (() => void) | null;

	const mockWindow = {
		addEventListener(_: string, callback: () => void) {
			onResize = callback;
		},
		removeEventListener() {
			onResize = null;
		},
	};

	beforeEach(() => {
		document.body.innerHTML = domSnippet;
		iframe = document.getElementById('iframe1');
		reset(mockWindow);
		expect.hasAssertions();
	});

	afterEach(() => {
		iframe = null;
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

type Viewport = { width: number; height: number };

/**
 * Expects `window.innerWidth` or `document.body.clientWidth` to return
 * a value
 *
 * @returns
 */
const getViewport = (): Viewport => {
	return {
		width: window.innerWidth || document.body.clientWidth || 0,
		height: window.innerHeight || document.body.clientHeight || 0,
	};
};

export { getViewport, Viewport };

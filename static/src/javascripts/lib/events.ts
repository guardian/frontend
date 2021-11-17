// Detecting options support
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#safely_detecting_option_support
// Nov 2021: We still need to check https://caniuse.com/?search=passive
// As browser support can be as low as 75% for certain features.

let supportsOptions = false;

try {
	const opts = {
		get passive() {
			// This function will be called when the browser
			//   attempts to access the passive property.
			supportsOptions = true;
			return false;
		},
	};

	//@ts-expect-error -- we’re testing feature support
	window.addEventListener('test', null, opts);
	//@ts-expect-error -- we’re testing feature support
	window.removeEventListener('test', null, opts);
} catch (e) {
	/* noop */
}

const addEventListener = (
	node: EventTarget,
	name: string,
	handler: (e: Event) => void,
	{
		passive = false,
		capture = false,
		once = false,
	}: AddEventListenerOptions = {},
): void => {
	if (supportsOptions) {
		node.addEventListener(name, handler, { passive, capture, once });
	} else if (once) {
		node.addEventListener(
			name,
			function boundHandler(this: EventTarget, evt: Event) {
				handler.call(this, evt);
				node.removeEventListener(name, boundHandler);
			},
			capture,
		);
	} else {
		node.addEventListener(name, handler, capture);
	}
};

export { addEventListener };

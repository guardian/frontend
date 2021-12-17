const initEmbedResize = () => {
	const allIframes = [].slice.call(
		document.querySelectorAll(
			'.element-embed > .email-sub__iframe, #footer__email-form',
		),
	);

	// Tell the iframes to resize once this script is loaded
	// Otherwise, earlier resize events might be missed
	allIframes.forEach((iframe) => {
		if (iframe && iframe.contentWindow)
			iframe.contentWindow.postMessage("resize", "*");
	});

	const allowedOrigins = ['https://www.theguardian.com']
	if (window.guardian.config.page.isDev) {
		allowedOrigins.push('https://m.code.dev-theguardian.com')
	}
	window.addEventListener('message', (event) => {
        if (!allowedOrigins.includes(event.origin)) return

		const iframes = allIframes.filter((i) => {
			try {
				return (
					i.contentWindow === event.source
				);
			} catch (e) {
				return false;
			}
		});
		if (iframes.length !== 0) {
			try {
				const message = JSON.parse(event.data);
				switch (message.type) {
					case 'set-height':
						const value = parseInt(message.value);
						if (!Number.isInteger(value)) return;

						iframes.forEach((iframe) => {
							iframe.height = `${value}`;
						});
						break;
					default:
				}
				// eslint-disable-next-line no-empty
			} catch (e) {}
		}
	});
};
export { initEmbedResize };

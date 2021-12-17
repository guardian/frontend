const initEmbedResize = () => {
	const allIframes = [].slice.call(
		document.querySelectorAll(
			'.element-embed > .email-sub__iframe, #footer__email-form',
		),
	);

    const allowedOrigins = ['https://www.theguardian.com', 'https://m.code.dev-theguardian.com', 'http://localhost:9000']

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
							iframe.height = value;
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

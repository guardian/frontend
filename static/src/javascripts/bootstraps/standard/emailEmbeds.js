const allowedOrigins = [
    'https://www.theguardian.com',
    'https://theguardian.com',
    'https://m.code.dev-theguardian.com',
    'http://localhost:3000'
]
const initEmbedResize = () => {
    const allIframes = [].slice.call(
        document.querySelectorAll('.element-embed > .email-sub__iframe, #footer__email-form'),
    );
    window.addEventListener('message', event => {
        if (!allowedOrigins.includes(event.origin)) return
        const message = JSON.parse(event.data)
        const iframes = allIframes.filter(i => {
            try {
                if (message.src)
                    return i.src === message.src
                else
                    return i.src === event.source.location.href
            } catch (e) {
                return false
            }
        })

        if (iframes.length !== 0) {
            try {
                switch (message.type) {
                    case 'set-height':
                        iframes.forEach( iframe => {
                            iframe.height = message.value;
                        })
                        break;
                    default:
                }
                // eslint-disable-next-line no-empty
            } catch (e) {
            }
        }
    });
};
export { initEmbedResize };

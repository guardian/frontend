const initEmbedResize = () => {
    const allIframes = [].slice.call(
        document.querySelectorAll('.element-embed > .email-sub__iframe')
    );

    window.addEventListener('message', event => {
        const iframes = allIframes.filter(i => {
            try {
                return i.src === event.source.location.href;
            } catch (e) {
                return false;
            }
        });
        if (iframes.length !== 0) {
            try {
                const message = JSON.parse(event.data);
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

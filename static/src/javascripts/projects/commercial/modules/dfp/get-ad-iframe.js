const getAdvertIframe = (adSlot) =>
    new Promise((resolve, reject) => {
        // DFP will sometimes return empty iframes, denoted with a '__hidden__' parameter embedded in its ID.
        // We need to be sure only to select the ad content frame.
        const contentFrame = (adSlot.querySelector(
            'iframe:not([id*="__hidden__"])'
        ));

        if (!contentFrame) {
            reject();
        } else if (
            // According to Flow, readyState exists on the Document, not the HTMLIFrameElement
            // Is this different for old IE?

            contentFrame.readyState &&
            contentFrame.readyState !== 'complete'
        ) {
            // On IE, wait for the frame to load before interacting with it
            const getIeIframe = e => {
                const updatedIFrame = e.srcElement;


                if (updatedIFrame && updatedIFrame.readyState === 'complete') {
                    updatedIFrame.removeEventListener(
                        'readystatechange',
                        getIeIframe
                    );
                    resolve(contentFrame);
                }
            };

            contentFrame.addEventListener('readystatechange', getIeIframe);
        } else {
            resolve(contentFrame);
        }
    });

/**
 * Not all adverts render themselves - some just provide data for templates that we implement in commercial.js.
 * This looks for any such data and, if we find it, renders the appropriate component.
 */
const getAdIframe = (adSlot) =>
    getAdvertIframe(adSlot).then(() =>
        Promise.resolve(true)
    );

export { getAdIframe };

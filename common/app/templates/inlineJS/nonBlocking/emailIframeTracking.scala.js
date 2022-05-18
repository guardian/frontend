@()

const sendEvent = (payload, eventType) => {
    const msg = {
        id: 'xxxxxxxxxx'.replace(/x/g, () =>
            // eslint-disable-next-line no-bitwise
            ((Math.random() * 36) | 0).toString(36)
        ),
        type: `ophan-iframe-${eventType}`,
        iframeId: window.frameElement ? window.frameElement.id : null,
        value: payload,
    };
    window.parent.postMessage(msg, '*');
    return msg.id;
};

const getClickEvent = (el) => {
    return {
        clickComponent: el.getAttribute('data-component'), clickLinkNames: [el.getAttribute('data-link-name')]
    }
}

function validateForm() {
	const formElement = document.querySelector('form');
	return formElement.checkValidity();
}

function sendTrackingUsingButton() {
    console.log('sendTrackingUsingButton')
    const submitButton = document.querySelector('button[type=submit]');
    if (!submitButton) {
        console.warn('no submit button')
        return;
    }

    const clickEvent = getClickEvent(submitButton)
    console.log({clickEvent})
    sendEvent(clickEvent, 'click-event')
}

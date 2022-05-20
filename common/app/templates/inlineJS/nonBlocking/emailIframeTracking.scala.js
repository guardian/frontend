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

const getSubmitEvent = (formElement) => {
    return {
        clickComponent: formElement.getAttribute('data-component'), clickLinkNames: [formElement.getAttribute('data-link-name')]
    }
}

const trackClickEvent = (buttonElement) => {
    if (!buttonElement) { return {} }
    buttonElement.addEventListener('click', (event) => {
        const clickEvent = getClickEvent(buttonElement)
        sendEvent(clickEvent, 'click-event')
    })
}

function validateForm() {
	const formElement = document.querySelector('form');
	return formElement.checkValidity();
}

function sendTrackingForFormSubmission() {
    const submitEventData = getSubmitEvent(document.querySelector('form'))
    sendEvent(submitEventData, 'submit-event')
}

trackClickEvent(document.querySelector("button[type=submit]"))

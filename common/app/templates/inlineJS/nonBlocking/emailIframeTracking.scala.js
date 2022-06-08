@()

// Events without a type explictily supported in Ophan's iframe handler script
// will be ignored.
const sendEvent = (payload, eventType) => {
    const msg = {
        id: 'xxxxxxxxxx'.replace(/x/g, () =>
            // eslint-disable-next-line no-bitwise
            ((Math.random() * 36) | 0).toString(36)
        ),
        type: eventType,
        iframeId: window.frameElement ? window.frameElement.id : null,
        value: payload,
    };
    window.parent.postMessage(msg, '*');
    return msg.id;
};

const getClickEvent = (el) => {
    return {
        clickComponent: el.getAttribute('data-component'),
        clickLinkNames: [el.getAttribute('data-link-name')]
    }
}

const buildComponentEvent = (formElement, actionType, actionDescription) => ({
    componentEvent: {
        component: {
            componentType: 'NEWSLETTER_SUBSCRIPTION',
            id: formElement.getAttribute('data-component'),
        },
        action: actionType,
        value: [actionDescription,formElement.getAttribute('data-email-list-name')].join(),
    }
});

const trackClickEvent = (buttonElement) => {
    if (!buttonElement) { return {} }
    buttonElement.addEventListener('click', (event) => {
        const clickEvent = getClickEvent(buttonElement)
        sendEvent(clickEvent, 'ophan-iframe-click-event')
    })
}

function validateForm() {
	const formElement = document.querySelector('form');
	return formElement.checkValidity();
}

function sendTrackingForFormSubmission() {
    const componentEventData = buildComponentEvent(document.querySelector('form'), 'SUBSCRIBE', 'form-submission')
    sendEvent(componentEventData, 'ophan-iframe-component-event')
}

function sendTrackingForCaptchaOpen() {
    const componentEventData = buildComponentEvent(document.querySelector('form'), "EXPAND", "open-captcha")
    sendEvent(componentEventData, 'ophan-iframe-component-event')
}

function sendTrackingForCaptchaExpire() {
    const componentEventData = buildComponentEvent(document.querySelector('form'), "CLOSE", "captcha-expired")
    sendEvent(componentEventData, 'ophan-iframe-component-event')
}

function sendTrackingForCaptchaError() {
    const componentEventData = buildComponentEvent(document.querySelector('form'), "CLOSE", "captcha-error")
    sendEvent(componentEventData, 'ophan-iframe-component-event')
}


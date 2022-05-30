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
        clickComponent: el.getAttribute('data-component'),
        clickLinkNames: [el.getAttribute('data-link-name')]
    }
}

const getComponentEvent = (formElement, actionType, actionDescription) => {
    return {
        component: {
            componentType: 'NEWSLETTER_SUBSCRIPTION',
            id: formElement.getAttribute('data-component'),
        },
        action: actionType,
        value: [actionDescription,formElement.getAttribute('data-email-list-name')],
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
    const componentEventData = getComponentEvent(document.querySelector('form'),"SUBSCRIBE", "form-submission")
    sendEvent(componentEventData, 'component-event')
}

function sendTrackingForCaptchaLoad() {
    const componentEventData = getComponentEvent(document.querySelector('form'),"EXPAND", "open-captcha")
    sendEvent(componentEventData, 'component-event')
}

function sendTrackingForCaptchaExpire() {
    const componentEventData = getComponentEvent(document.querySelector('form'),"CLOSE", "captcha-expired")
    sendEvent(componentEventData, 'component-event')
}

function sendTrackingForCaptchaError() {
    const componentEventData = getComponentEvent(document.querySelector('form'),"CLOSE", "captcha-error")
    sendEvent(componentEventData, 'component-event')
}


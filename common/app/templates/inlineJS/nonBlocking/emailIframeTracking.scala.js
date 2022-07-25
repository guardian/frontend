@()

// Posts message objects to the parent window to be handled
// by Ophan's iframe-tracking module.
// The "type" property must be a value explicitly handled
// by iframe-tracking or the event will be ignored.
function sendEventDataToParent (payload, eventType) {
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

function getClickEventData (element) {
    return {
        clickComponent: element.getAttribute('data-component'),
        clickLinkNames: [element.getAttribute('data-link-name')]
    }
}


function buildComponentEventData (formElement, action, eventDescription) {
    const value = JSON.stringify({
		eventDescription,
		newsletterId: formElement.getAttribute('data-email-list-name'),
		timestamp: new Date().getTime(),
	});

    return {
        componentEvent: {
            component: {
                componentType: 'NEWSLETTER_SUBSCRIPTION',
                id: formElement.getAttribute('data-component'),
            },
            action,
            value,
        }
    }
};

function trackClickEvent (buttonElement) {
    if (!buttonElement) return;
    buttonElement.addEventListener('click', function (event){
        const clickEventData = getClickEventData(buttonElement)
        sendEventDataToParent(clickEventData, 'ophan-iframe-click-event')
    })
}

function validateForm() {
	const formElement = document.querySelector('form');
	return formElement.checkValidity();
}

function sendTrackingForFormSubmission() {
    const componentEventData = buildComponentEventData(document.querySelector('form'), 'SUBSCRIBE', 'form-submission')
    sendEventDataToParent(componentEventData, 'ophan-iframe-component-event')
}

function sendTrackingForCaptchaOpen() {
    const componentEventData = buildComponentEventData(document.querySelector('form'), "EXPAND", "open-captcha")
    sendEventDataToParent(componentEventData, 'ophan-iframe-component-event')
}

function sendTrackingForCaptchaExpire() {
    const componentEventData = buildComponentEventData(document.querySelector('form'), "CLOSE", "captcha-expired")
    sendEventDataToParent(componentEventData, 'ophan-iframe-component-event')
}

function sendTrackingForCaptchaError() {
    const componentEventData = buildComponentEventData(document.querySelector('form'), "CLOSE", "captcha-error")
    sendEventDataToParent(componentEventData, 'ophan-iframe-component-event')
}


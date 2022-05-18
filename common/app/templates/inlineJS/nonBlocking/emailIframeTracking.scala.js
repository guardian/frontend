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


// TO DO - VALIDATE PROPERLY
// need to figure out how to include regex without causing scala compilation failure
function validateEmail(input) {
	return input.indexOf('.') !== -1;
}

function validateForm() {
	const formElement = document.querySelector('form');
	const submitButton = formElement.querySelector('[type=submit]');
	const emailField = formElement.querySelector('[type=email]');
	if (!submitButton || !emailField) {
		alert('missing field');
		return false;
	}

	const emailValue = emailField.value;

	if (
		!emailValue ||
		emailValue.length > 250 ||
		!validateEmail(emailValue)
	) {
		alert('INVALID INPUT');
		return false;
	}

	return true;
}

function sendTrackingUsingButton() {
    console.log('sendTrackingUsingButton')
    const submitButton = document.getElementById("email-embed-signup-button--old")
    if (!submitButton) {
        console.warn('no submit button')
        return;
    }

    const clickEvent = getClickEvent(submitButton)
    console.log({clickEvent})
    sendEvent(clickEvent, 'click-event')
}

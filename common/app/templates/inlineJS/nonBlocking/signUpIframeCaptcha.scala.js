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



window.addEventListener('message', (event) => {
	const allowedOrigins = ['https://www.theguardian.com'];
	if (!allowedOrigins.includes(event.origin)) return;
	if (event.data === 'resize') resizeToCurrentHeight();
});
setupSubmitListener();
resizeToCurrentHeight();

function resizeToCurrentHeight() {
	iframeMessenger.resize();
}

const resizeToOriginalHeight = (() => {
	const originalHeight = document.body.clientHeight;
	return () => sendResizeMessage(originalHeight);
})();

function sendResizeMessage(height) {
	iframeMessenger.resize(height);
}

function resizeToFitCaptcha() {
	sendResizeMessage(500);
}

function setupSubmitListener() {
	const submitButton = document.querySelector(
		'.email-sub__form button[type=submit]'
	);
	submitButton.addEventListener('click', (e) => onSubmit(e));
}

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

function onSubmit(e) {
	e.preventDefault();

	var formIsValid = validateForm();

	console.log({ formIsValid });

	if (formIsValid) {
		(function (d, script) {
			script = d.createElement('script');
			script.type = 'text/javascript';
			script.async = true;
			script.defer = true;
			script.src =
				'https://www.google.com/recaptcha/api.js?onload=onRecaptchaScriptLoaded&render=explicit';
			d.getElementsByTagName('head')[0].appendChild(script);
		})(document);
	}
}

function onRecaptchaScriptLoaded() {
    console.log('onRecaptchaScriptLoaded')
	resizeToFitCaptcha();
	const captchaContainer = document.getElementsByClassName(
		'grecaptcha_container'
	)[0];
	grecaptcha.render(captchaContainer, {
		sitekey: window.guardian.config.page.googleRecaptchaSiteKey,
		callback: onCaptchaCompleted,
		'error-callback': onCaptchaError,
		'expired-callback': onCaptchaExpired,
		size: 'invisible',
	});
	grecaptcha.execute();
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

    console.log('!!', sendEvent, getClickEvent)
}


function onCaptchaCompleted(token) {
    console.log('onCaptchaCompleted')
	resizeToOriginalHeight();
    console.log('valid form?',validateForm())
    sendTrackingUsingButton()
    alert('submitTime!')
	// document.querySelector('.email-sub__form').submit();
}

function onCaptchaError() {
	resizeToOriginalHeight();
}

function onCaptchaExpired() {
	resizeToOriginalHeight();
}

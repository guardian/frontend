@()

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

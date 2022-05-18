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
    const formElement = document.querySelector('form');
    if (!formElement) {return}
	formElement.addEventListener('submit', (e) => onSubmit(e));
}

function onSubmit(e) {
	e.preventDefault();
	const formIsValid = validateForm();

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
	resizeToFitCaptcha();
	const captchaContainer = document.querySelector('.grecaptcha_container');
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
	resizeToOriginalHeight();
    sendTrackingForFormSubmission()
    alert('submitTime!')
	document.querySelector('form').submit();
}

function onCaptchaError() {
	resizeToOriginalHeight();
}

function onCaptchaExpired() {
	resizeToOriginalHeight();
}

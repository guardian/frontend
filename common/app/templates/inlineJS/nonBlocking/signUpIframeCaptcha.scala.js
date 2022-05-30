@()

window.addEventListener('message', (event) => {
	const allowedOrigins = ['https://www.theguardian.com'];
	if (!allowedOrigins.includes(event.origin)) return;
	if (event.data === 'resize') resizeToCurrentHeight();
});
trackClickEvent(document.querySelector("button[type=submit]"))
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

    if (!window.grecaptcha) { // grecaptcha has not yet been rendered
        (function (d, script) {
            script = d.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.src =
                'https://www.google.com/recaptcha/api.js?onload=onRecaptchaScriptLoaded&render=explicit';
            d.getElementsByTagName('head')[0].appendChild(script);
        })(document);
    } else { // grecaptcha has already been rendered, but been dismissed or expired
        resizeToFitCaptcha();
        sendTrackingForCaptchaLoad();
        grecaptcha.execute();
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
    sendTrackingForCaptchaLoad()
	grecaptcha.execute();
}

function onCaptchaCompleted(token) {
	resizeToOriginalHeight();
    sendTrackingForFormSubmission()
	document.querySelector('form').submit();
}

function onCaptchaError() {
    sendTrackingForCaptchaError();
	resizeToOriginalHeight();
}

function onCaptchaExpired() {
    sendTrackingForCaptchaExpire()
	resizeToOriginalHeight();
}

import fastdom from 'fastdom';
import $ from 'lib/$';
import config from 'lib/config';
import { getUserFromCookie, getUserFromApi } from 'common/modules/identity/api';
import ophan from 'ophan/ng';

const classes = {
	wrapper: 'js-newsletter-meta',
	signupForm: 'js-email-sub__form',
	textInput: 'js-newsletter-card__text-input',
	signupButton: 'js-newsletter-signup-button',
	styleSignup: 'newsletter-card__lozenge--submit',
	signupConfirm: 'js-signup-confirmation',
	failureMessage: 'js-signup-fail-message',
	previewButton: 'js-newsletter-preview',
	card: 'newsletter-card',
};

const trackingEvents = {
	submit: 'form-submission',
	confirm: 'submission-confirmed',
	fail: 'submission-failed',
	openCaptcha: 'open-captcha',
	loadError: 'captcha-load-error',
};

const inputs = {
	email: 'email',
};

let lastEventDataSent = undefined;
let lastEventDataSentTimestamp = 0;

const buildComponentEventData = (cardElement, action, eventDescription) => {
	const listNameInput = cardElement.querySelector('input[name=listName]');
	const newsletterId = listNameInput
		? listNameInput.value
		: '[unknown list name]';

	const value = JSON.stringify({
		eventDescription,
		newsletterId,
		timestamp: new Date().getTime(),
	});

	return {
		componentEvent: {
			component: {
				componentType: 'NEWSLETTER_SUBSCRIPTION',
				id: cardElement.getAttribute('data-component'),
			},
			action,
			value,
		},
	};
};

const isNewsletterCard = (element) =>
	element.hasAttribute('data-component') &&
	element.classList.contains(classes.card);

const findContainingCard = (originalElement) => {
	let element = originalElement;
	while (element.parentElement) {
		if (isNewsletterCard(element)) {
			return element;
		}
		element = element.parentElement;
	}
	return undefined;
};


const sendTracking = (element, eventType, eventExtraDetail) => {
	const cardElement = findContainingCard(element);
	if (!cardElement) {
		return;
	}

	let action = 'CLICK';

	switch (eventType) {
		case trackingEvents.submit:
			action = 'ANSWER';
			break;
		case trackingEvents.confirm:
			action = 'SUBSCRIBE';
			break;
		case trackingEvents.fail:
			action = 'CLOSE';
			break;
		case trackingEvents.loadError:
			action = 'CLOSE';
			break;
		case trackingEvents.openCaptcha:
			action = 'EXPAND';
			break;
	}

	const eventDescription = eventExtraDetail
		? [eventType, eventExtraDetail].join('|')
		: eventType;

	const eventData = buildComponentEventData(
		cardElement,
		action,
		eventDescription,
	);

	// The user can click the submit button multiple times while the grecaptcha.execute
	// is happening, triggering the listener created at createSubscriptionFormEventHandlers
	// which triggers 'showCaptcha' multiple times.
	// There is no 'onReady' callback or hook on the grecaptcha.execute function that could
	// be used to disable and re-enable the submit button, so to limit multiple events for the
	// same 'openCaptcha', events are not sent if they happen wihin 1 second of an identical
	// event that was reported.
	// 1 second is an approximation - how long it take grecaptcha.execute to finish will depend
	// on network and client conditions.
	const now = Date.now();
	if (
		lastEventDataSent &&
		lastEventDataSent.componentEvent.component.id ===
			eventData.componentEvent.component.id &&
		lastEventDataSent.componentEvent.value ===
			eventData.componentEvent.value &&
		now - lastEventDataSentTimestamp < 1000
	) {
		return;
	}

	ophan.record(eventData);
	lastEventDataSent = eventData;
	lastEventDataSentTimestamp = now;
};

const hideInputAndShowPreview = (el) => {
	fastdom.mutate(() => {
		$(`.${classes.textInput}`, el).addClass('is-hidden');
		$(`.${classes.signupButton}`, el).removeClass(classes.styleSignup);
		$(`.${classes.previewButton}`, el).removeClass('is-hidden');
	});
};

const validate = (form) => {
	// simplistic email address validation
	const emailAddress = $(`.${classes.textInput}`, form).val();
	return typeof emailAddress === 'string' && emailAddress.indexOf('@') > -1;
};

const addConfirmationMessage = (buttonEl, isSuccess) => {
	const meta = $.ancestor(buttonEl, classes.wrapper);
	fastdom.mutate(() => {
		$(buttonEl.form).addClass('is-hidden');
		$(`.${classes.previewButton}`, meta).addClass('is-hidden');
		$(
			`.${isSuccess ? classes.signupConfirm : classes.failureMessage}`,
			meta,
		).removeClass('is-hidden');
	});
};

const modifyDataLinkName = (modifier) => (el) => {
	const firstStageName =
		el.getAttribute('data-link-name') || 'undefined-data-link-name';
	el.setAttribute('data-link-name', firstStageName + modifier);
};

const modifyLinkNamesForSecondStage = (el) =>
	modifyDataLinkName('-second-stage')(el);

const modifyLinkNamesForSignedInUser = (el) =>
	modifyDataLinkName('-signed-in')(el);

const submitForm = (form, buttonEl) => {
	buttonEl.setAttribute('disabled', 'true');

	const email = encodeURIComponent(
		$(`input[name="${inputs.email}"]`, form).val(),
	);
	const listName = encodeURIComponent(
		$('input[name="listName"]', form).val(),
	);
	const csrfToken = encodeURIComponent(
		$('input[name="csrfToken"]', form).val(),
	);
	const ref = encodeURIComponent(window.location.href);
	const refViewId = encodeURIComponent(config.get('ophan.pageViewId'));
	const googleRecaptchaResponse = encodeURIComponent(
		$('[name="g-recaptcha-response"]', form).val(),
	);

	let formQueryString = `${inputs.email}=${email}`;
	formQueryString += `&csrfToken=${csrfToken}`;
	formQueryString += `&listName=${listName}`;
	formQueryString += `&ref=${ref}`;
	formQueryString += `&refViewId=${refViewId}`;
	if (window.guardian.config.switches.emailSignupRecaptcha) {
		formQueryString += `&g-recaptcha-response=${googleRecaptchaResponse}`;
	}

	sendTracking(form, trackingEvents.submit);

	return fetch(`${config.get('page.ajaxUrl')}/email`, {
		method: 'POST',
		body: formQueryString,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	}).then((response) => {
		if (response.ok) {
			addConfirmationMessage(buttonEl, true);
			sendTracking(form, trackingEvents.confirm);
		} else {
			addConfirmationMessage(buttonEl, false);
			response
				.text()
				.then((errorText) => {
					sendTracking(form, trackingEvents.fail, errorText);
				})
				.catch((e) => {
					sendTracking(form, trackingEvents.fail, '[no error text]');
				});
		}
	});
};

const createSubscriptionFormEventHandlers = (buttonEl) => {
	buttonEl.addEventListener('click', (event) => {
		event.preventDefault();

		if (buttonEl.getAttribute('disabled') === true) {
			return;
		}

		const form = buttonEl.form;
		if (validate(form)) {
			if (window.guardian.config.switches.emailSignupRecaptcha) {
				showCaptcha(
					form,
					() => submitForm(form, buttonEl),
					() => {
						sendTracking(form, trackingEvents.loadError);
						addConfirmationMessage(buttonEl, false);
					},
				);
			} else {
				submitForm(form, buttonEl);
			}
		}
	});
};

const showCaptcha = (form, callback, loadErrorCallback) => {
	const captchaContainer = $('.grecaptcha_container', form).get(0);

	// The first captcha id will be "0" (falsy in js) so check for type
	if (typeof form.captchaId === 'undefined') {
		form.captchaId = grecaptcha.render(captchaContainer, {
			sitekey: window.guardian.config.page.googleRecaptchaSiteKey,
			callback: callback,
			'data-error-callback': loadErrorCallback,
			size: 'invisible',
		});
	}

	grecaptcha.execute(form.captchaId);
	sendTracking(form, trackingEvents.openCaptcha);
};

const modifyFormForSignedIn = (el) => {
	modifyLinkNamesForSignedInUser(el);
	createSubscriptionFormEventHandlers(el);
};

const showSignupForm = (buttonEl) => {
	const form = buttonEl.form;
	const meta = $.ancestor(buttonEl, 'js-newsletter-meta');
	fastdom.mutate(() => {
		$(`.${classes.textInput}`, form).removeClass('is-hidden').focus();
		$(`.${classes.signupButton}`, form).addClass(classes.styleSignup);
		$(`.${classes.previewButton}`, meta).addClass('is-hidden');
		modifyLinkNamesForSecondStage(buttonEl);
		createSubscriptionFormEventHandlers(buttonEl);
	});
};

const updatePageForLoggedIn = (emailAddress, el) => {
	fastdom.mutate(() => {
		hideInputAndShowPreview(el);
		$(`.${classes.textInput}`, el).val(emailAddress);
	});
};

const showSecondStageSignup = (buttonEl) => {
	fastdom.mutate(() => {
		buttonEl.setAttribute('type', 'button');
		buttonEl.addEventListener(
			'click',
			() => {
				showSignupForm(buttonEl);
			},
			{ once: true },
		);
	});
};

const enhanceNewsletters = () => {
	if (getUserFromCookie() !== null) {
		// email address is not stored in the cookie, gotta go to the Api
		getUserFromApi((userFromId) => {
			if (userFromId && userFromId.primaryEmailAddress) {
				updatePageForLoggedIn(userFromId.primaryEmailAddress);
				$.forEachElement(
					`.${classes.signupButton}`,
					modifyFormForSignedIn,
				);
			}
		});
	} else {
		hideInputAndShowPreview();
		$.forEachElement(`.${classes.signupButton}`, showSecondStageSignup);
	}
};

const init = () => {
	enhanceNewsletters();
};

export { init };

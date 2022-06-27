import bean from 'bean';
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
	previewButton: 'js-newsletter-preview',
	card: 'newsletter-card',
};

const inputs = {
	email: 'email',
	dummy: 'name',
};

const buildComponentEventData = (
	cardElement,
	actionType,
	actionDescription,
) => {
	const listNameInput = cardElement.querySelector('input[name=listName]');
	const listName = listNameInput
		? listNameInput.value
		: '[unknown list name]';

	return {
		componentEvent: {
			component: {
				componentType: 'NEWSLETTER_SUBSCRIPTION',
				id: cardElement.getAttribute('data-component'),
			},
			action: actionType,
			value: [actionDescription, listName].join(),
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

const addSubscriptionMessage = (buttonEl) => {
	const meta = $.ancestor(buttonEl, classes.wrapper);
	fastdom.mutate(() => {
		$(buttonEl.form).addClass('is-hidden');
		$(`.${classes.previewButton}`, meta).addClass('is-hidden');
		$(`.${classes.signupConfirm}`, meta).removeClass('is-hidden');
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
	const dummyEmail = encodeURIComponent(
		$(`input[name="${inputs.dummy}"]`, form).val(),
	); // Used as a 'bot-bait', see https://stackoverflow.com/a/34623588/2823715
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
	formQueryString += `&${inputs.dummy}=${dummyEmail}`;
	if (window.guardian.config.switches.emailSignupRecaptcha) {
		formQueryString += `&g-recaptcha-response=${googleRecaptchaResponse}`;
	}

    const cardElement = findContainingCard(form);
	if (cardElement) {
		const eventData = buildComponentEventData(
			cardElement,
			'SUBSCRIBE',
			'form-submission',
		);
		ophan.record(eventData);
		console.log(eventData);
	}

	return fetch(`${config.get('page.ajaxUrl')}/email`, {
		method: 'POST',
		body: formQueryString,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	}).then((response) => {
		if (response.ok) {
			addSubscriptionMessage(buttonEl);
		}
	});
};

const createSubscriptionFormEventHandlers = (buttonEl) => {
	bean.on(buttonEl, 'click', (event) => {
		event.preventDefault();
		const form = buttonEl.form;
		if (validate(form)) {
			if (window.guardian.config.switches.emailSignupRecaptcha) {
				showCaptcha(form, () => submitForm(form, buttonEl));
			} else {
				submitForm(form, buttonEl);
			}
		}
	});
};

const showCaptcha = (form, callback) => {
	const captchaContainer = $('.grecaptcha_container', form).get(0);

	const cardElement = findContainingCard(form);
	if (cardElement) {
		const eventData = buildComponentEventData(
			cardElement,
			'EXPAND',
			'open-captcha',
		);
		ophan.record(eventData);
		console.log(eventData);
	}

	const captchaId = grecaptcha.render(captchaContainer, {
		sitekey: window.guardian.config.page.googleRecaptchaSiteKey,
		callback: callback,
		size: 'invisible',
	});
	grecaptcha.execute(captchaId);
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
		bean.on(buttonEl, 'click', () => {
			showSignupForm(buttonEl);
		});
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

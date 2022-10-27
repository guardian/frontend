import { reportError } from './report-error';
import config from './config';

const ERR_INVALID_COOKIE_NAME = `Cookie must not contain invalid characters (space, tab and the following characters: '()<>@,;"/[]?={}')`;

// subset of https://github.com/guzzle/guzzle/pull/1131
const isValidCookieValue = (name) => !/[()<>@,;"\\/[\]?={} \t]/g.test(name);

const getShortDomain = ({ isCrossSubdomain = false } = {}) => {
	const domain = document.domain || '';

	if (domain === 'localhost' || config.get('page.isPreview')) {
		return domain;
	}

	// Trim any possible subdomain (will be shared with supporter, identity, etc)
	if (isCrossSubdomain) {
		return ['', ...domain.split('.').slice(-2)].join('.');
	}
	// Trim subdomains for prod (www.theguardian), code (m.code.dev-theguardian) and dev (dev.theguardian, m.thegulocal)
	return domain.replace(/^(www|m\.code|dev|m)\./, '.');
};

const getDomainAttribute = ({ isCrossSubdomain = false } = {}) => {
	const shortDomain = getShortDomain({ isCrossSubdomain });
	return shortDomain === 'localhost' ? '' : ` domain=${shortDomain};`;
};

const removeCookie = (name, currentDomainOnly = false) => {
	const expires = 'expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	const path = 'path=/;';

	// Remove cookie, implicitly using the document's domain.
	document.cookie = `${name}=;${path}${expires}`;
	if (!currentDomainOnly) {
		// also remove from the short domain
		document.cookie = `${name}=;${path}${expires} domain=${getShortDomain()};`;
	}
};

const addCookie = (name, value, daysToLive, isCrossSubdomain = false) => {
	const expires = new Date();

	if (!isValidCookieValue(name) || !isValidCookieValue(value)) {
		reportError(
			new Error(`${ERR_INVALID_COOKIE_NAME} .${name}=${value}`),
			{},
			false,
		);
	}

	if (daysToLive) {
		expires.setDate(expires.getDate() + daysToLive);
	} else {
		expires.setMonth(expires.getMonth() + 5);
		expires.setDate(1);
	}

	document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute(
		{
			isCrossSubdomain,
		},
	)}`;
};

const cleanUp = (names) => {
	names.forEach((name) => {
		removeCookie(name);
	});
};

const addForMinutes = (name, value, minutesToLive) => {
	const expires = new Date();

	if (!isValidCookieValue(name) || !isValidCookieValue(value)) {
		reportError(
			new Error(`${ERR_INVALID_COOKIE_NAME} .${name}=${value}`),
			{},
			false,
		);
	}

	expires.setMinutes(expires.getMinutes() + minutesToLive);
	document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()};${getDomainAttribute()}`;
};

const addSessionCookie = (name, value) => {
	if (!isValidCookieValue(name) || !isValidCookieValue(value)) {
		reportError(
			new Error(`${ERR_INVALID_COOKIE_NAME} .${name}=${value}`),
			{},
			false,
		);
	}
	document.cookie = `${name}=${value}; path=/;${getDomainAttribute()}`;
};

const getCookieValues = (name) => {
	const nameEq = `${name}=`;
	const cookies = document.cookie.split(';');

	return cookies.reduce((acc, cookie) => {
		const cookieTrimmed = cookie.trim();

		if (cookieTrimmed.indexOf(nameEq) === 0) {
			acc.push(
				cookieTrimmed.substring(nameEq.length, cookieTrimmed.length),
			);
		}

		return acc;
	}, []);
};

const getCookie = (name) => {
	const cookieVal = getCookieValues(name);

	if (cookieVal.length > 0) {
		return cookieVal[0];
	}
	return null;
};

export const _ = {
	isValidCookieValue,
};

export {
	cleanUp,
	addCookie,
	addSessionCookie,
	addForMinutes,
	removeCookie,
	getCookie,
};

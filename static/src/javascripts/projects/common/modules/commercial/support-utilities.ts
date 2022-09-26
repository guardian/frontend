import {
	countryCodeToSupportInternationalisationId,
	getCountryCode,
} from '../../../../lib/geolocation';

type SupportUrlProtocol = 'https://';
type SupportUrlDomain = 'support.theguardian.com';
type SupportUrlPath = 'contribute' | 'subscribe';
type SupportUrlRaw =
	`${SupportUrlProtocol}${SupportUrlDomain}/${SupportUrlPath}`;
const supportUrlRegex = /(support.theguardian.com)\/(contribute|subscribe)/;

const addCountryGroupToSupportLink = (rawUrl: SupportUrlRaw): string => {
	const countryCode = getCountryCode();
	const countryGroup =
		countryCodeToSupportInternationalisationId(countryCode);
	return rawUrl.replace(
		(_, domain: SupportUrlDomain, path: SupportUrlPath) =>
		supportUrlRegex,
			`${domain}/${countryGroup.toLowerCase()}/${path}`,
	);
};

const supportContributeURL = (): string =>
	addCountryGroupToSupportLink('https://support.theguardian.com/contribute');
const supportSubscribeURL = (): string =>
	addCountryGroupToSupportLink('https://support.theguardian.com/subscribe');
const supportSubscribeDigitalURL = (): string =>
	`${supportSubscribeURL()}/digital`;

export {
	supportContributeURL,
	supportSubscribeURL,
	supportSubscribeDigitalURL,
	addCountryGroupToSupportLink,
};

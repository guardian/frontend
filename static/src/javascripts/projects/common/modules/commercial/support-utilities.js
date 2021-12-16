import {
	countryCodeToSupportInternationalisationId,
	getCountryCode,
} from '../../../../lib/geolocation';

const addCountryGroupToSupportLink = (rawUrl) => {
	const countryCode = getCountryCode();
	if (countryCode) {
		const countryGroup =
			countryCodeToSupportInternationalisationId(countryCode);
		return rawUrl.replace(
			/(support.theguardian.com)\/(contribute|subscribe)/,
			(_, domain, path) =>
				`${domain}/${countryGroup.toLowerCase()}/${path}`,
		);
	}

	return rawUrl;
};

const supportContributeGeoRedirectURL =
	'https://support.theguardian.com/contribute';
const supportSubscribeGeoRedirectURL =
	'https://support.theguardian.com/subscribe';
const supportContributeURL = () =>
	addCountryGroupToSupportLink(supportContributeGeoRedirectURL);
const supportSubscribeURL = () =>
	addCountryGroupToSupportLink(supportSubscribeGeoRedirectURL);
const supportSubscribeDigitalURL = () => `${supportSubscribeURL()}/digital`;

export {
	supportContributeGeoRedirectURL,
	supportSubscribeGeoRedirectURL,
	supportContributeURL,
	supportSubscribeURL,
	supportSubscribeDigitalURL,
	addCountryGroupToSupportLink,
};

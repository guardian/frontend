import { addReferrerData } from './acquisitions-ophan';
import { addCountryGroupToSupportLink } from './support-utilities';

// Currently the only acquisition components on the site are
// from the Mother Load campaign and the Wide Brown Land campaign.
// Work needs to be done so we don't have to hard code what campaigns are running.
const validIframeUrls = [
	'https://interactive.guim.co.uk/embed/2017/12/the-mother-load/',
	'https://interactive.guim.co.uk/embed/2018/this-wide-brown-land/',
];

const isCurrentCampaign = (iframeSrc) =>
	validIframeUrls.some((validIframeUrl) =>
		iframeSrc.startsWith(validIframeUrl),
	);

const addReferrerDataToAcquisitionLink = (rawUrl) => {
	const acquisitionDataField = 'acquisitionData';

	let url;
	try {
		url = new URL(rawUrl);
	} catch (e) {
		return rawUrl;
	}

	let acquisitionData;
	try {
		const acquisitionDataJsonString =
			url.searchParams.get(acquisitionDataField);

		if (!acquisitionDataJsonString) return rawUrl;

		acquisitionData = JSON.parse(acquisitionDataJsonString);
	} catch (e) {
		return rawUrl;
	}

	if (acquisitionData) {
		acquisitionData = addReferrerData(acquisitionData);
		url.searchParams.set(
			acquisitionDataField,
			JSON.stringify(acquisitionData),
		);
	}

	return url.toString();
};

const ACQUISITION_LINK_CLASS = 'js-acquisition-link';

const enrichAcquisitionLinksOnPage = () => {
	const links = Array.from(
		document.getElementsByClassName(ACQUISITION_LINK_CLASS),
	);

	links.forEach((el) => {
		const link = el.getAttribute('href');
		if (link) {
			let modifiedLink = addReferrerDataToAcquisitionLink(link);
			modifiedLink = addCountryGroupToSupportLink(modifiedLink);
			el.setAttribute('href', modifiedLink);
		}
	});
};

const addReferrerDataToAcquisitionLinksInInteractiveIframes = () => {
	window.addEventListener('message', (event) => {
		let data;
		try {
			data = JSON.parse(event.data);
		} catch (e) {
			return;
		}

		// TODO: remove this when only https://github.com/guardian/acquisition-iframe-tracking
		// TODO: is being used for acquisition iframe tracking
		// Expects enrich requests to be made via iframe-messenger:
		// https://github.com/guardian/iframe-messenger
		if (data.type === 'enrich-acquisition-links' && data.id) {
			data.referrerData = addReferrerData({});
			Array.from(document.getElementsByTagName('iframe')).forEach(
				(iframe) => {
					iframe.contentWindow.postMessage(
						JSON.stringify(data),
						'https://interactive.guim.co.uk',
					);
				},
			);
		}

		if (data.type === 'acquisition-data-request') {
			Array.from(document.getElementsByTagName('iframe')).forEach(
				(el) => {
					const iframeSrc = el.getAttribute('src');
					if (iframeSrc && isCurrentCampaign(iframeSrc)) {
						el.contentWindow.postMessage(
							JSON.stringify({
								type: 'acquisition-data-response',
								acquisitionData: {
									...addReferrerData({}),
									source: 'GUARDIAN_WEB',
								},
							}),
							'*',
						);
					}
				},
			);
		}
	});
};

export const init = () => {
	addReferrerDataToAcquisitionLinksInInteractiveIframes();
	enrichAcquisitionLinksOnPage();
};

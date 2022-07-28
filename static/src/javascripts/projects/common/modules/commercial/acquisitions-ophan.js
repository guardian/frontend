import ophan from 'ophan/ng';
import config from '../../../../lib/config';
import { constructQuery as constructURLQuery } from '../../../../lib/url';

export const submitComponentEvent = (componentEvent) => {
	ophan.record({ componentEvent });
};

export const submitInsertEvent = (componentEvent) =>
	submitComponentEvent({
		...componentEvent,
		action: 'INSERT',
	});

export const submitViewEvent = (componentEvent) =>
	submitComponentEvent({
		...componentEvent,
		action: 'VIEW',
	});

export const submitClickEvent = (componentEvent) =>
	submitComponentEvent({
		...componentEvent,
		action: 'CLICK',
	});

export const addReferrerData = (acquisitionData) =>
	// Note: the current page is the referrer data in the context of the acquisition.
	({
		...acquisitionData,
		referrerPageviewId: config.get('ophan.pageViewId'),
		referrerUrl: window.location.href.split('?')[0],
	});

// Adds acquisition tracking codes if it is a support url
export const addTrackingCodesToUrl = ({
	base,
	componentType,
	componentId,
	campaignCode,
	abTest,
}) => {
	const isSupportUrl =
		base.search(
			/(support.theguardian.com)(\/[a-z]*)?\/(contribute|subscribe)/,
		) >= 0;

	if (isSupportUrl) {
		const acquisitionData = addReferrerData({
			source: 'GUARDIAN_WEB',
			componentId,
			componentType,
			campaignCode,
			abTest,
		});

		const params = {
			REFPVID: config.get('ophan.pageViewId') || 'not_found',
			INTCMP: campaignCode,
			acquisitionData: JSON.stringify(acquisitionData),
		};

		return `${base}${base.includes('?') ? '&' : '?'}${constructURLQuery(
			params,
		)}`;
	}

	return base;
};

import type { OphanComponent } from '@guardian/libs';

const ACQ_QS_ARG = 'acquisitionData';

export const addTrackingToUrl = (
	urlString: string,
	ophanComponent: OphanComponent,
	referrerUrl: string,
	referrerPageviewId: string,
): string => {
	const acquisitionData = JSON.stringify({
		source: 'GUARDIAN_WEB',
		componentId: ophanComponent.id,
		componentType: ophanComponent.componentType,
		campaignCode: ophanComponent.id,
		referrerPageviewId,
		referrerUrl,
		labels: ophanComponent.labels,
	});

	const url = new URL(urlString);
	const qs = new URLSearchParams(url.search);
	if (qs.has(ACQ_QS_ARG)) {
		qs.delete(ACQ_QS_ARG);
	}
	qs.set(ACQ_QS_ARG, acquisitionData);
	url.search = qs.toString();

	return url.toString();
};

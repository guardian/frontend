import type { OphanComponentEvent } from '@guardian/libs';
import ophan from 'ophan/ng';
import config from '../../../../lib/config';

type OphanComponentEventWithoutAction = Omit<OphanComponentEvent, 'action'>;

export const submitComponentEvent = (
	componentEvent: OphanComponentEvent,
): void => {
	ophan.record({ componentEvent });
};

export const submitInsertEvent = (
	componentEvent: OphanComponentEventWithoutAction,
): void =>
	submitComponentEvent({
		...componentEvent,
		action: 'INSERT',
	});

export const submitViewEvent = (
	componentEvent: OphanComponentEventWithoutAction,
): void =>
	submitComponentEvent({
		...componentEvent,
		action: 'VIEW',
	});

export const submitClickEvent = (
	componentEvent: OphanComponentEventWithoutAction,
): void =>
	submitComponentEvent({
		...componentEvent,
		action: 'CLICK',
	});

export const addReferrerData = (
	acquisitionData: Record<string, unknown>,
): Record<string, unknown> =>
	// Note: the current page is the referrer data in the context of the acquisition.
	({
		...acquisitionData,
		referrerPageviewId: config.get('ophan.pageViewId'),
		referrerUrl: window.location.href.split('?')[0],
	});

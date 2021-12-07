//import { isUndefined } from '@guardian/libs';
import { memoize } from 'lodash-es';
import reportError from 'lib/report-error';

export const fetchNonRefreshableLineItemIds = async (): Promise<
	number[] | undefined
> => {
	const response = await window.fetch(
		'/commercial/non-refreshable-line-items.json',
	);
	if (response.ok) {
		const json: unknown = await response.json();
		if (Array.isArray(json)) {
			// Return undefined if any of the elements in the array are not numbers
			return json.reduce<number[] | undefined>(
				(accum, lineItemId) =>
					accum !== undefined && typeof lineItemId === 'number'
						? [...accum, lineItemId]
						: undefined,
				[],
			);
		}
	} else {
		// Report an error to Sentry if we don't get an ok response
		reportError(
			new Error('Failed to fetch non-refreshable line items'),
			{
				feature: 'commercial',
				status: response.status,
			},
			false,
		);
	}
	return undefined;
};

export const memoizedFetchNonRefreshableLineItemIds = memoize(
	fetchNonRefreshableLineItemIds,
);

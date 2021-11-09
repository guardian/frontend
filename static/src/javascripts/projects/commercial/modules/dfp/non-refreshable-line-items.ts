import { memoize } from 'lodash-es';
import reportError from 'lib/report-error';

export const fetchNonRefreshableLineItemIds = async (): Promise<
	number[] | undefined
> => {
	const response = await window.fetch(
		'/commercial/dfp-non-refreshable-line-items.json',
	);
	if (response.ok) {
		const json: unknown = await response.json();
		if (Array.isArray(json)) {
			return json.map((x) => Number(x));
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

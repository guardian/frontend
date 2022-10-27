import { memoize } from 'lodash-es';
import { reportError } from 'lib/report-error';

export const fetchNonRefreshableLineItemIds = async (): Promise<number[]> => {
	// When the env is CODE or local, use the CODE env's non-refreshable line items file
	const { host, isProd } = window.guardian.config.page;
	const fileHost = isProd ? host : 'https://m.code.dev-theguardian.com';

	const fileLocation = new URL(
		'/commercial/non-refreshable-line-items.json',
		fileHost,
	);

	const response = await fetch(fileLocation.toString());

	if (response.ok) {
		const json: unknown = await response.json();
		if (!Array.isArray(json)) {
			throw Error(
				'Failed to parse non-refreshable line items as an array',
			);
		}

		// Throw an error if any of the elements in the array are not numbers
		const lineItemsOrError = json.reduce<{ lineItems: number[] } | Error>(
			(accum, lineItemId) =>
				!(accum instanceof Error) && typeof lineItemId === 'number'
					? { lineItems: [...accum.lineItems, lineItemId] }
					: Error(
							'Failed to parse element in non-refreshable line item array as number',
					  ),
			{ lineItems: [] },
		);

		if (lineItemsOrError instanceof Error) {
			throw lineItemsOrError;
		}

		return lineItemsOrError.lineItems;
	}

	// Report an error to Sentry if we don't get an ok response
	// Note that in other cases (JSON parsing failure) we throw but don't report the error
	const error = Error('Failed to fetch non-refreshable line items');
	reportError(
		error,
		{
			feature: 'commercial',
			status: String(response.status),
		},
		false,
	);
	throw error;
};

export const memoizedFetchNonRefreshableLineItemIds = memoize(
	fetchNonRefreshableLineItemIds,
);

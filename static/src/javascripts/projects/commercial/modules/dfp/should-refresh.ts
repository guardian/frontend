import type { AdSizeString } from '@guardian/commercial-core';
import { adSizes } from '@guardian/commercial-core';
import config from '../../../../lib/config';
import type { Advert } from './Advert';

const outstreamSizes = [
	adSizes.outstreamDesktop.toString(),
	adSizes.outstreamMobile.toString(),
	adSizes.outstreamGoogleDesktop.toString(),
];

/**
 * Determine whether an advert should refresh, taking into account
 * its size, whether there's a pageskin or whether the advert's
 * line item is marked as non-refreshable
 *
 *  - Fluid ads should not refresh
 *  - Outstream ads should not refresh
 *  - Pageskins should not refresh
 *  - Ads that have line items marked as non-refreshable should not be
 * 	  refreshed. This information is retrieved via the DFP non refreshable
 * 	  line item API endpoint
 *
 * @param advert The candidate advert to check
 * @param nonRefreshableLineItemIds The array of line item ids for which
 * adverts should not refresh
 */
export const shouldRefresh = (
	advert: Advert,
	nonRefreshableLineItemIds: number[] = [],
): boolean => {
	const sizeString = advert.size?.toString();
	const isNotFluid = sizeString !== '0,0';
	const isOutstream =
		sizeString && outstreamSizes.includes(sizeString as AdSizeString);
	const isNonRefreshableLineItem =
		advert.lineItemId &&
		nonRefreshableLineItemIds.includes(advert.lineItemId);

	return (
		isNotFluid &&
		!isOutstream &&
		!config.get('page.hasPageSkin') &&
		!isNonRefreshableLineItem
	);
};

// @flow

// (date: 08/04/2020) This should be a temporary solution for changing the order of the reader revenue banners

import { getReaderRevenueRegion } from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { local } from 'lib/storage';

import { membershipEngagementBanner } from 'common/modules/commercial/membership-engagement-banner';
import { subscriptionBanner } from 'common/modules/ui/subscription-banners/subscription-banner';

// types
import type { ReaderRevenueRegion } from 'common/modules/commercial/contributions-utilities';
import type { Banner } from 'common/modules/ui/bannerPicker';

const currentRegion: ReaderRevenueRegion = getReaderRevenueRegion(
    geolocationGetSync()
);

const pageViews: number = local.get('gu.alreadyVisited');

const orderBanners = (region: ReaderRevenueRegion, ...banners): Banner[] => region === 'united-kingdom' ? banners : banners.reverse();

const showFromFourthPageView = (currentPageViews: number, banners: Banner[]): Banner[] => {
    if (currentPageViews <= 3) {
        banners[1].canShow = () => Promise.resolve(false);
    }

    return banners;
}

const orderedBanners = orderBanners(currentRegion, subscriptionBanner, membershipEngagementBanner);

const readRevenueBanners = showFromFourthPageView(pageViews, orderedBanners);

export default readRevenueBanners;
